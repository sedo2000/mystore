import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const urlObj = new URL(request.url);
  const domain = process.env.NEXT_PUBLIC_SITE_URL || `${urlObj.protocol}//${urlObj.host}`;
  const webhookUrl = `${domain}/api/telegram`;

  if (!token || !secret) {
    return NextResponse.json({ error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_WEBHOOK_SECRET in environment variables' }, { status: 400 });
  }

  try {
    const telegramApiUrl = `https://api.telegram.org/bot${token}/setWebhook`;
    const res = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: secret,
        allowed_updates: ["channel_post", "edited_channel_post"]
      })
    });

    const data = await res.json();
    return NextResponse.json({ success: true, webhookUrl, telegramResponse: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
