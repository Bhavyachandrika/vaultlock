import { describe, expect, it, beforeAll } from 'vitest';
import { encryptPassword, decryptPassword, generateEncryptionKey } from './encryption';

// Set encryption key for testing
beforeAll(() => {
  process.env.ENCRYPTION_KEY = generateEncryptionKey();
});

describe('Encryption', () => {
  it('should encrypt and decrypt a password correctly', () => {
    const plaintext = 'MySecurePassword123!';
    const encrypted = encryptPassword(plaintext);
    const decrypted = decryptPassword(encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertexts for the same plaintext', () => {
    const plaintext = 'TestPassword';
    const encrypted1 = encryptPassword(plaintext);
    const encrypted2 = encryptPassword(plaintext);

    // Due to random IV, ciphertexts should be different
    expect(encrypted1).not.toBe(encrypted2);

    // But both should decrypt to the same plaintext
    expect(decryptPassword(encrypted1)).toBe(plaintext);
    expect(decryptPassword(encrypted2)).toBe(plaintext);
  });

  it('should handle special characters in passwords', () => {
    const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const encrypted = encryptPassword(plaintext);
    const decrypted = decryptPassword(encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it('should handle long passwords', () => {
    const plaintext = 'a'.repeat(1000);
    const encrypted = encryptPassword(plaintext);
    const decrypted = decryptPassword(encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it('should handle empty passwords', () => {
    const plaintext = '';
    const encrypted = encryptPassword(plaintext);
    const decrypted = decryptPassword(encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it('should fail to decrypt with wrong key', () => {
    const plaintext = 'TestPassword';
    const encrypted = encryptPassword(plaintext);

    // Change the encryption key
    const originalKey = process.env.ENCRYPTION_KEY;
    process.env.ENCRYPTION_KEY = generateEncryptionKey();

    // Decryption should fail or produce garbage
    expect(() => decryptPassword(encrypted)).toThrow();

    // Restore original key
    process.env.ENCRYPTION_KEY = originalKey;
  });
});
