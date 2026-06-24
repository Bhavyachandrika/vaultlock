/**
 * Password strength analysis utility.
 * Analyzes passwords for strength, weakness, reuse, and age.
 */

export interface PasswordStrengthAnalysis {
  score: number; // 0-100
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  feedback: string[];
  isWeak: boolean;
}

/**
 * Calculate password strength score (0-100).
 * Factors: length, character variety, entropy, common patterns.
 */
export function analyzePasswordStrength(password: string): PasswordStrengthAnalysis {
  let score = 0;
  const feedback: string[] = [];

  // Length scoring (0-30 points)
  if (password.length >= 20) score += 30;
  else if (password.length >= 16) score += 25;
  else if (password.length >= 12) score += 20;
  else if (password.length >= 8) score += 10;
  else {
    score += 5;
    feedback.push('Password is too short (minimum 12 characters recommended)');
  }

  // Character variety scoring (0-40 points)
  let varietyScore = 0;
  if (/[a-z]/.test(password)) varietyScore += 10;
  if (/[A-Z]/.test(password)) varietyScore += 10;
  if (/[0-9]/.test(password)) varietyScore += 10;
  if (/[^a-zA-Z0-9]/.test(password)) varietyScore += 10;

  score += varietyScore;

  if (varietyScore < 30) {
    feedback.push('Add uppercase, lowercase, numbers, and special characters');
  }

  // Check for common patterns (deduct points)
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('Avoid repeating characters');
  }

  if (/^[a-zA-Z]+$|^[0-9]+$/.test(password)) {
    score -= 15;
    feedback.push('Mix different character types');
  }

  // Check for keyboard patterns
  if (/(qwerty|asdfgh|zxcvbn|123456|password)/i.test(password)) {
    score -= 20;
    feedback.push('Avoid common keyboard patterns and dictionary words');
  }

  // Entropy bonus (0-30 points)
  const entropy = calculateEntropy(password);
  if (entropy >= 60) score += 30;
  else if (entropy >= 50) score += 25;
  else if (entropy >= 40) score += 20;
  else if (entropy >= 30) score += 10;

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine strength level
  let strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  if (score < 30) strength = 'weak';
  else if (score < 50) strength = 'fair';
  else if (score < 70) strength = 'good';
  else if (score < 85) strength = 'strong';
  else strength = 'very-strong';

  return {
    score,
    strength,
    feedback: feedback.length > 0 ? feedback : ['Password is strong'],
    isWeak: score < 50,
  };
}

/**
 * Calculate Shannon entropy of a password.
 * Higher entropy = more randomness = stronger password.
 */
function calculateEntropy(password: string): number {
  const charSet = new Set(password);
  const charSetSize = charSet.size;
  
  if (charSetSize === 0) return 0;
  
  // Entropy = log2(charSetSize) * passwordLength
  return Math.log2(charSetSize) * password.length;
}

/**
 * Detect if a password is commonly used or weak.
 */
export function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    'password',
    '123456',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
  ];

  return commonPasswords.some(common => 
    password.toLowerCase().includes(common.toLowerCase())
  );
}

/**
 * Check if a password is considered old (created more than X days ago).
 * Default: 90 days.
 */
export function isOldPassword(createdAt: Date, daysThreshold: number = 90): boolean {
  const now = new Date();
  const ageInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return ageInDays > daysThreshold;
}

/**
 * Calculate overall vault security score based on password analysis.
 * Takes into account: weak passwords, reused passwords, old passwords.
 */
export function calculateVaultSecurityScore(
  totalPasswords: number,
  weakPasswordCount: number,
  reusedPasswordCount: number,
  oldPasswordCount: number
): { score: number; percentage: number; level: string } {
  if (totalPasswords === 0) {
    return { score: 100, percentage: 100, level: 'Excellent' };
  }

  // Base score
  let score = 100;

  // Deduct for weak passwords (up to 30 points)
  const weakPenalty = (weakPasswordCount / totalPasswords) * 30;
  score -= weakPenalty;

  // Deduct for reused passwords (up to 25 points)
  const reusedPenalty = (reusedPasswordCount / totalPasswords) * 25;
  score -= reusedPenalty;

  // Deduct for old passwords (up to 15 points)
  const oldPenalty = (oldPasswordCount / totalPasswords) * 15;
  score -= oldPenalty;

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine level
  let level = 'Excellent';
  if (score < 30) level = 'Critical';
  else if (score < 50) level = 'Poor';
  else if (score < 70) level = 'Fair';
  else if (score < 85) level = 'Good';
  else if (score < 95) level = 'Very Good';

  return {
    score: Math.round(score),
    percentage: Math.round(score),
    level,
  };
}
