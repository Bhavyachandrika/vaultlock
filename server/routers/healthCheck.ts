import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getUserVaultEntries } from '../db';
import { decryptPassword } from '../encryption';
import { analyzePasswordStrength, isOldPassword, isCommonPassword } from '../passwordStrength';

export const healthCheckRouter = router({
  analyze: protectedProcedure.query(async ({ ctx }) => {
    const entries = await getUserVaultEntries(ctx.user.id);
    const analysis: any[] = [];
    const passwordMap = new Map<string, number[]>();

    for (const entry of entries) {
      try {
        const decrypted = decryptPassword(entry.encryptedPassword);
        const strength = analyzePasswordStrength(decrypted);
        const isOld = isOldPassword(entry.createdAt, 90);
        const isCommon = isCommonPassword(decrypted);

        analysis.push({
          id: entry.id,
          title: entry.title,
          website: entry.website,
          strengthScore: strength.score,
          strengthLevel: strength.strength,
          isWeak: strength.isWeak,
          isOld,
          isCommon,
          feedback: strength.feedback,
          createdAt: entry.createdAt,
        });

        // Track password reuse
        if (!passwordMap.has(decrypted)) {
          passwordMap.set(decrypted, []);
        }
        passwordMap.get(decrypted)!.push(entry.id);
      } catch (error) {
        console.error('Failed to analyze entry:', error);
      }
    }

    // Mark reused passwords
    const reusedIds = new Set<number>();
    passwordMap.forEach((ids, password) => {
      if (ids.length > 1) {
        ids.forEach(id => reusedIds.add(id));
      }
    });

    // Update analysis with reuse info
    const finalAnalysis = analysis.map(item => ({
      ...item,
      isReused: reusedIds.has(item.id),
    }));

    // Calculate summary
    const weakCount = finalAnalysis.filter(a => a.isWeak).length;
    const reusedCount = finalAnalysis.filter(a => a.isReused).length;
    const oldCount = finalAnalysis.filter(a => a.isOld).length;
    const commonCount = finalAnalysis.filter(a => a.isCommon).length;

    // Group by issue
    const issues = {
      weak: finalAnalysis.filter(a => a.isWeak),
      reused: finalAnalysis.filter(a => a.isReused),
      old: finalAnalysis.filter(a => a.isOld),
      common: finalAnalysis.filter(a => a.isCommon),
    };

    return {
      entries: finalAnalysis,
      summary: {
        total: entries.length,
        weak: weakCount,
        reused: reusedCount,
        old: oldCount,
        common: commonCount,
      },
      issues,
      recommendations: generateRecommendations(weakCount, reusedCount, oldCount, commonCount, entries.length),
    };
  }),

  getIssues: protectedProcedure.query(async ({ ctx }) => {
    const entries = await getUserVaultEntries(ctx.user.id);
    const issues: any[] = [];

    for (const entry of entries) {
      try {
        const decrypted = decryptPassword(entry.encryptedPassword);
        const strength = analyzePasswordStrength(decrypted);

        if (strength.isWeak) {
          issues.push({
            id: entry.id,
            title: entry.title,
            type: 'weak',
            severity: 'high',
            message: 'This password is weak and should be updated',
            feedback: strength.feedback,
          });
        }

        if (isOldPassword(entry.createdAt, 90)) {
          issues.push({
            id: entry.id,
            title: entry.title,
            type: 'old',
            severity: 'medium',
            message: 'This password is older than 90 days',
          });
        }

        if (isCommonPassword(decrypted)) {
          issues.push({
            id: entry.id,
            title: entry.title,
            type: 'common',
            severity: 'high',
            message: 'This password is commonly used',
          });
        }
      } catch (error) {
        console.error('Failed to analyze entry:', error);
      }
    }

    return issues;
  }),
});

function generateRecommendations(
  weakCount: number,
  reusedCount: number,
  oldCount: number,
  commonCount: number,
  total: number
): string[] {
  const recommendations: string[] = [];

  if (total === 0) {
    recommendations.push('Start adding passwords to your vault to get security recommendations');
    return recommendations;
  }

  if (weakCount > 0) {
    recommendations.push(
      `You have ${weakCount} weak password(s). Use the password generator to create stronger passwords.`
    );
  }

  if (reusedCount > 0) {
    recommendations.push(
      `You have ${reusedCount} reused password(s). Each account should have a unique password.`
    );
  }

  if (oldCount > 0) {
    recommendations.push(
      `You have ${oldCount} password(s) older than 90 days. Consider updating them regularly.`
    );
  }

  if (commonCount > 0) {
    recommendations.push(
      `You have ${commonCount} commonly used password(s). Avoid dictionary words and common patterns.`
    );
  }

  if (weakCount === 0 && reusedCount === 0 && oldCount === 0 && commonCount === 0) {
    recommendations.push('Your vault security is excellent! Keep up the good practices.');
  }

  return recommendations;
}
