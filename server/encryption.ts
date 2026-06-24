import crypto from 'crypto';
import { ENV } from './_core/env';

/**
 * AES-256 encryption utility for secure password storage.
 * Uses AES-256-GCM for authenticated encryption with associated data.
 * 
 * Flow:
 * 1. Generate a random 16-byte IV (initialization vector)
 * 2. Encrypt plaintext with AES-256-GCM using the encryption key
 * 3. Get the authentication tag (16 bytes)
 * 4. Return: IV + ciphertext + auth tag as a single encrypted string
 * 
 * On decryption:
 * 1. Extract IV, ciphertext, and auth tag from the encrypted string
 * 2. Decrypt and verify using the same key and auth tag
 * 3. Return plaintext
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Get the encryption key from environment variables.
 * The key must be exactly 32 bytes (256 bits) for AES-256.
 */
function getEncryptionKey(): Buffer {
  const keyEnv = ENV.encryptionKey;
  if (!keyEnv) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  
  // If the key is hex-encoded, decode it
  const key = Buffer.from(keyEnv, 'hex');
  
  if (key.length !== 32) {
    throw new Error(`ENCRYPTION_KEY must be 32 bytes (256 bits), got ${key.length} bytes`);
  }
  
  return key;
}

/**
 * Encrypt a plaintext password using AES-256-GCM.
 * 
 * @param plaintext - The password to encrypt
 * @returns Base64-encoded string containing IV + ciphertext + auth tag
 */
export function encryptPassword(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV + ciphertext + auth tag and encode as base64
    const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex'), authTag]);
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt password');
  }
}

/**
 * Decrypt an encrypted password using AES-256-GCM.
 * 
 * @param encrypted - Base64-encoded string containing IV + ciphertext + auth tag
 * @returns Decrypted plaintext password
 */
export function decryptPassword(encrypted: string): string {
  try {
    const key = getEncryptionKey();
    
    // Decode from base64
    const combined = Buffer.from(encrypted, 'base64');
    
    // Extract IV, ciphertext, and auth tag
    const iv = combined.slice(0, IV_LENGTH);
    const authTag = combined.slice(combined.length - AUTH_TAG_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH, combined.length - AUTH_TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(ciphertext.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt password');
  }
}

/**
 * Generate a random encryption key (32 bytes for AES-256).
 * This is a utility function for key generation, not used in production.
 * 
 * @returns Hex-encoded 32-byte key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}
