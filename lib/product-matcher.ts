import { supabaseAdmin } from './supabase';
import { getTelegramFileUrl } from './telegram';

export async function processAndSaveProduct({
  channelId,
  messageId,
  text,
  photoFileId,
  mediaGroupId
}: {
  channelId: string;
  messageId: number;
  text: string;
  photoFileId?: string;
  mediaGroupId?: string;
}) {
  const { parseTelegramPost } = await import('./parser');
  const parsed = parseTelegramPost(text);
  if (!parsed || !parsed.name) {
    throw new Error('Could not parse product name from text');
  }

  let imageUrl = null;
  if (photoFileId) {
    const telegramUrl = await getTelegramFileUrl(photoFileId);
    if (telegramUrl) {
      try {
        const imgRes = await fetch(telegramUrl);
        const buffer = await imgRes.arrayBuffer();
        const fileName = `tg_${channelId}_${messageId}_${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('products')
          .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabaseAdmin.storage.from('products').getPublicUrl(fileName);
          imageUrl = publicUrlData.publicUrl;
        }
      } catch (imgErr) {
        console.error('Failed to download/upload image to Supabase:', imgErr);
      }
    }
  }

  // 1. Check by channel_id + message_id relationship
  let { data: existingByMsg } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('telegram_channel_id', channelId)
    .eq('telegram_message_id', messageId)
    .single();

  let productId: string;

  if (existingByMsg) {
    productId = existingByMsg.id;
    await supabaseAdmin
      .from('products')
      .update({
        name: parsed.name,
        normalized_name: parsed.normalized_name,
        description: parsed.description,
        price: parsed.price > 0 ? parsed.price : existingByMsg.price,
        image_url: imageUrl || existingByMsg.image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);
  } else {
    // 2. Check by normalized_name (Duplicate prevention rule)
    let { data: existingByName } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('normalized_name', parsed.normalized_name)
      .single();

    if (existingByName) {
      productId = existingByName.id;
      await supabaseAdmin
        .from('products')
        .update({
          price: parsed.price > 0 ? parsed.price : existingByName.price,
          description: parsed.description || existingByName.description,
          telegram_channel_id: channelId,
          telegram_message_id: messageId,
          image_url: imageUrl || existingByName.image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);
    } else {
      // 3. Create new product
      const { data: newProd, error: insertErr } = await supabaseAdmin
        .from('products')
        .insert({
          name: parsed.name,
          normalized_name: parsed.normalized_name,
          description: parsed.description,
          price: parsed.price,
          currency: parsed.currency,
          image_url: imageUrl,
          telegram_channel_id: channelId,
          telegram_message_id: messageId,
          telegram_media_group_id: mediaGroupId,
          source: 'telegram_bot',
          is_active: true
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      productId = newProd.id;
    }
  }

  // Save/Update telegram post log
  await supabaseAdmin.from('telegram_posts').upsert({
    channel_id: channelId,
    message_id: messageId,
    product_id: productId,
    raw_text: text,
    processed_at: new Date().toISOString()
  }, { onConflict: 'channel_id,message_id' });

  if (imageUrl) {
    await supabaseAdmin.from('product_images').insert({
      product_id: productId,
      image_url: imageUrl,
      sort_order: 0
    });
  }

  return productId;
}
