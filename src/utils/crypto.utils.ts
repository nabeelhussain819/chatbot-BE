/* eslint-disable prettier/prettier */
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // Must be 16 bytes
const SECRET_KEY = crypto
  .createHash('sha256')
  .update(process.env.CARD_SECRET_KEY || 'your-32-char-secret-key-here')
  .digest('base64')
  .substring(0, 32); // ensure exactly 32 bytes

export function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // Store IV with ciphertext, separated by ":"
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !encrypted) throw new Error('Malformed encrypted data');

    const iv = Buffer.from(ivHex, 'hex');
    if (iv.length !== IV_LENGTH) throw new Error('Invalid IV length');

    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err.message);
    return ''; // Avoid crashing your API
  }
}
