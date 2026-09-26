import { NextResponse } from 'next/server';
import { processAndSaveProduct } from '@/lib/product-matcher';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const secretHeader = req.headers.get('x-telegram-bot-api-secret-token');
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

    if (expectedSecret && secretHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updateId = body.update_id;

    // Handle channel post or edited channel post
    const postObj = body.channel_post || body.edited_channel_post;
    if (!postObj) {
      return NextResponse.json({ ok: true }); // Acknowledge non-channel updates quickly
    }

    const chatId = postObj.chat?.id?.toString() || postObj.chat?.username;
    const configuredChannelId = process.env.TELEGRAM_CHANNEL_ID;

    if (configuredChannelId && chatId !== configuredChannelId && `@${postObj.chat?.username}` !== configuredChannelId) {
      return NextResponse.json({ ok: true, message: 'Ignored unauthorized channel' });
    }

    const messageId = postObj.message_id;
    const text = postObj.text || postObj.caption || '';
    const mediaGroupId = postObj.media_group_id;

    let photoFileId = undefined;
    if (postObj.photo && Array.isArray(postObj.photo) && postObj.photo.length > 0) {
      // Get the highest resolution photo
      photoFileId = postObj.photo[postObj.photo.length - 1].file_id;
    }

    try {
      await processAndSaveProduct({
        channelId: chatId,
        messageId,
        text,
        photoFileId,
        mediaGroupId
      });
    } catch (procErr: any) {
      console.error('Processing error:', procErr);
      await supabaseAdmin.from('sync_logs').insert({
        error: procErr.message || String(procErr),
        update_id: updateId,
        message_id: messageId,
        channel_id: chatId
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Webhook critical error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
