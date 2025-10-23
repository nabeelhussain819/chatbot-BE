/* eslint-disable prettier/prettier */
// src/utils/text-cleaner.ts
export function cleanText(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/<!--.*?-->/g, '')
    .trim();
}

export function chunkText(text: string, maxLength = 1000): string[] {
  const words = text.split(' ');
  const chunks: string[] = [];
  let current: string[] = [];

  for (const word of words) {
    if ((current.join(' ') + ' ' + word).length > maxLength) {
      chunks.push(current.join(' '));
      current = [];
    }
    current.push(word);
  }

  if (current.length) chunks.push(current.join(' '));
  return chunks;
}
