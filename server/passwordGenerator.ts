import crypto from 'crypto';

export interface PasswordGeneratorOptions {
  length: number; // 8-64
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean; // Exclude i, l, 1, L, o, 0, O, etc.
}

export interface GeneratedPassword {
  password: string;
  strength: string;
  entropy: number;
}

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Characters that look similar and should be excluded
const SIMILAR_CHARS = 'il1Lo0O';

/**
 * Generate a secure random password based on options.
 */
export function generatePassword(options: PasswordGeneratorOptions): GeneratedPassword {
  const {
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    excludeSimilar,
  } = options;

  // Validate length
  if (length < 8 || length > 64) {
    throw new Error('Password length must be between 8 and 64 characters');
  }

  // Build character set
  let charSet = '';

  if (includeLowercase) {
    charSet += excludeSimilar ? LOWERCASE.replace(/[il]/g, '') : LOWERCASE;
  }
  if (includeUppercase) {
    charSet += excludeSimilar ? UPPERCASE.replace(/[IO]/g, '') : UPPERCASE;
  }
  if (includeNumbers) {
    charSet += excludeSimilar ? NUMBERS.replace(/[01]/g, '') : NUMBERS;
  }
  if (includeSymbols) {
    charSet += SYMBOLS;
  }

  if (charSet.length === 0) {
    throw new Error('At least one character type must be selected');
  }

  // Generate password
  const password = generateRandomString(length, charSet);

  // Calculate strength and entropy
  const strength = calculatePasswordStrength(password);
  const entropy = calculateEntropy(charSet.length, length);

  return {
    password,
    strength,
    entropy,
  };
}

/**
 * Generate a random string of specified length from a character set.
 * Uses crypto.getRandomValues for cryptographic randomness.
 */
function generateRandomString(length: number, charSet: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let result = '';

  for (let i = 0; i < length; i++) {
    result += charSet[bytes[i] % charSet.length];
  }

  return result;
}

/**
 * Calculate password strength level.
 */
function calculatePasswordStrength(password: string): string {
  let score = 0;

  if (password.length >= 16) score += 3;
  else if (password.length >= 12) score += 2;
  else score += 1;

  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 2;

  if (score >= 8) return 'Very Strong';
  if (score >= 6) return 'Strong';
  if (score >= 4) return 'Good';
  if (score >= 2) return 'Fair';
  return 'Weak';
}

/**
 * Calculate Shannon entropy of the character set.
 * Entropy = log2(charSetSize) * passwordLength
 */
function calculateEntropy(charSetSize: number, passwordLength: number): number {
  if (charSetSize === 0) return 0;
  return Math.log2(charSetSize) * passwordLength;
}

/**
 * Validate password generator options.
 */
export function validatePasswordOptions(options: PasswordGeneratorOptions): string[] {
  const errors: string[] = [];

  if (options.length < 8 || options.length > 64) {
    errors.push('Password length must be between 8 and 64 characters');
  }

  if (
    !options.includeUppercase &&
    !options.includeLowercase &&
    !options.includeNumbers &&
    !options.includeSymbols
  ) {
    errors.push('At least one character type must be selected');
  }

  return errors;
}

/**
 * Get default password generator options.
 */
export function getDefaultPasswordOptions(): PasswordGeneratorOptions {
  return {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
  };
}
