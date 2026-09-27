export interface ParsedProduct {
  name: string;
  normalized_name: string;
  price: number;
  currency: string;
  description: string;
}

export function parseTelegramPost(text: string): ParsedProduct | null {
  if (!text) return null;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  let name = lines[0];
  let price = 0;
  let currency = 'IQD';
  let descriptionLines: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const priceMatch = line.match(/(?:السعر[:\s]*)?([0-9,]+(?:\.[0-9]+)?)\s*(دينار|د\.ع|iqd)?/i);
    if (priceMatch && price === 0) {
      price = parseFloat(priceMatch[1].replace(/,/g, ''));
      if (priceMatch[2]) {
        const curr = priceMatch[2].toLowerCase();
        if (curr.includes('دينار') || curr.includes('د.ع') || curr.includes('iqd')) {
          currency = 'IQD';
        }
      }
    } else {
      descriptionLines.push(line);
    }
  }

  if (price === 0) {
    const globalPriceMatch = text.match(/(?:السعر[:\s]*)?([0-9,]+(?:\.[0-9]+)?)\s*(دينار|د\.ع|iqd)/i);
    if (globalPriceMatch) {
      price = parseFloat(globalPriceMatch[1].replace(/,/g, ''));
    }
  }

  const cleanName = name.replace(/📦|🍎|🍊|🍋|🍌|🍉|🍇/g, '').trim();
  const normalized_name = cleanName.toLowerCase().replace(/\s+/g, ' ');

  return {
    name: cleanName,
    normalized_name,
    price: price || 0,
    currency,
    description: descriptionLines.join('\n')
  };
}
