import { describe, expect, it } from 'vitest';
import {
  analyzePasswordStrength,
  isCommonPassword,
  isOldPassword,
  calculateVaultSecurityScore,
} from './passwordStrength';

describe('Password Strength Analysis', () => {
  describe('analyzePasswordStrength', () => {
    it('should identify weak passwords', () => {
      const result = analyzePasswordStrength('123');
      expect(result.isWeak).toBe(true);
      expect(result.strength).toBe('weak');
    });

    it('should identify strong passwords', () => {
      const result = analyzePasswordStrength('MyStr0ng!P@ssw0rd');
      expect(result.isWeak).toBe(false);
      expect(['good', 'strong', 'very-strong']).toContain(result.strength);
    });

    it('should penalize repeated characters', () => {
      const result1 = analyzePasswordStrength('aaaaaaaaaa');
      const result2 = analyzePasswordStrength('aB3!xY9@mK');
      expect(result1.score).toBeLessThan(result2.score);
    });

    it('should penalize keyboard patterns', () => {
      const result = analyzePasswordStrength('qwerty123');
      expect(result.feedback.some(f => f.includes('keyboard'))).toBe(true);
    });

    it('should reward character variety', () => {
      const result = analyzePasswordStrength('aB3!xY9@mK');
      expect(result.score).toBeGreaterThan(50);
    });

    it('should provide feedback for short passwords', () => {
      const result = analyzePasswordStrength('Short1!');
      expect(result.feedback.some(f => f.includes('short'))).toBe(true);
    });
  });

  describe('isCommonPassword', () => {
    it('should detect common passwords', () => {
      expect(isCommonPassword('password123')).toBe(true);
      expect(isCommonPassword('123456')).toBe(true);
      expect(isCommonPassword('qwerty')).toBe(true);
    });

    it('should not flag uncommon passwords', () => {
      expect(isCommonPassword('MyUniqueP@ss123')).toBe(false);
    });
  });

  describe('isOldPassword', () => {
    it('should identify old passwords', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100);
      expect(isOldPassword(oldDate, 90)).toBe(true);
    });

    it('should not flag recent passwords', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 30);
      expect(isOldPassword(recentDate, 90)).toBe(false);
    });
  });

  describe('calculateVaultSecurityScore', () => {
    it('should return perfect score for empty vault', () => {
      const result = calculateVaultSecurityScore(0, 0, 0, 0);
      expect(result.score).toBe(100);
      expect(result.level).toBe('Excellent');
    });

    it('should penalize weak passwords', () => {
      const result1 = calculateVaultSecurityScore(10, 0, 0, 0);
      const result2 = calculateVaultSecurityScore(10, 5, 0, 0);
      expect(result2.score).toBeLessThan(result1.score);
    });

    it('should penalize reused passwords', () => {
      const result1 = calculateVaultSecurityScore(10, 0, 0, 0);
      const result2 = calculateVaultSecurityScore(10, 0, 3, 0);
      expect(result2.score).toBeLessThan(result1.score);
    });

    it('should penalize old passwords', () => {
      const result1 = calculateVaultSecurityScore(10, 0, 0, 0);
      const result2 = calculateVaultSecurityScore(10, 0, 0, 4);
      expect(result2.score).toBeLessThan(result1.score);
    });

    it('should assign correct security levels', () => {
      const poor = calculateVaultSecurityScore(10, 8, 5, 5);
      expect(['Critical', 'Poor', 'Fair']).toContain(poor.level);

      const good = calculateVaultSecurityScore(10, 1, 0, 0);
      expect(['Excellent', 'Very Good', 'Good']).toContain(good.level);
    });
  });
});
