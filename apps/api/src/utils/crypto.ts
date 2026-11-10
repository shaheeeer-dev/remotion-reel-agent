import crypto from 'node:crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT = 'social-agent-token-salt';

function getEncryptionKey(): Buffer {
  const secret = env.SESSION_SECRET || 'fallback-secret-for-development-32b';
  return crypto.scryptSync(secret, SALT, 32);
}

/**
 * Encrypt sensitive plain text (e.g. API tokens) using AES-256-GCM
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt AES-256-GCM encrypted token
 */
export function decryptToken(encryptedPayload: string): string {
  if (!encryptedPayload || !encryptedPayload.includes(':')) {
    return encryptedPayload;
  }

  const [ivHex, authTagHex, encryptedText] = encryptedPayload.split(':');
  if (!ivHex || !authTagHex || !encryptedText) {
    throw new Error('Malformed encrypted token format');
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivHex, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Strips raw tokens from social account objects before sending in HTTP responses
 */
export function sanitizeSocialAccount<T extends Record<string, any>>(account: T): Omit<T, 'encryptedToken'> {
  const { encryptedToken, ...safeAccount } = account;
  return safeAccount;
}
