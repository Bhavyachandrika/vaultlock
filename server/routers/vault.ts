import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import {
  createVaultEntry,
  deleteVaultEntry,
  getVaultEntryById,
  getUserVaultEntries,
  updateVaultEntry,
  getPasswordHealthCache,
} from '../db';
import { encryptPassword, decryptPassword } from '../encryption';
import { analyzePasswordStrength, calculateVaultSecurityScore, isOldPassword } from '../passwordStrength';

const CreateVaultEntrySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  website: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(1, 'Password is required'),
  notes: z.string().optional(),
  category: z.string().default('Personal'),
  tags: z.array(z.string()).optional(),
  favorite: z.boolean().default(false),
});

const UpdateVaultEntrySchema = z.object({
  title: z.string().optional(),
  website: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  favorite: z.boolean().optional(),
});

export const vaultRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const entries = await getUserVaultEntries(ctx.user.id);
    return entries.map(entry => ({
      id: entry.id,
      title: entry.title,
      website: entry.website,
      username: entry.username,
      email: entry.email,
      category: entry.category,
      tags: entry.tags ? JSON.parse(entry.tags) : [],
      favorite: entry.favorite === 1,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const entry = await getVaultEntryById(input.id, ctx.user.id);
      if (!entry) {
        throw new Error('Vault entry not found');
      }

      try {
        const decryptedPassword = decryptPassword(entry.encryptedPassword);
        return {
          id: entry.id,
          title: entry.title,
          website: entry.website,
          username: entry.username,
          email: entry.email,
          password: decryptedPassword,
          notes: entry.notes,
          category: entry.category,
          tags: entry.tags ? JSON.parse(entry.tags) : [],
          favorite: entry.favorite === 1,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        };
      } catch (error) {
        throw new Error('Failed to decrypt password');
      }
    }),

  create: protectedProcedure
    .input(CreateVaultEntrySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const encryptedPassword = encryptPassword(input.password);
        const result = await createVaultEntry({
          userId: ctx.user.id,
          title: input.title,
          website: input.website,
          username: input.username,
          email: input.email,
          encryptedPassword,
          notes: input.notes,
          category: input.category,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          favorite: input.favorite ? 1 : 0,
        });

        return {
          success: true,
          id: (result as any).insertId,
        };
      } catch (error) {
        console.error('Failed to create vault entry:', error);
        throw new Error('Failed to create vault entry');
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        ...UpdateVaultEntrySchema.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      try {
        const entry = await getVaultEntryById(id, ctx.user.id);
        if (!entry) {
          throw new Error('Vault entry not found');
        }

        const updateData: any = {};

        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.website !== undefined) updateData.website = updates.website;
        if (updates.username !== undefined) updateData.username = updates.username;
        if (updates.email !== undefined) updateData.email = updates.email;
        if (updates.password !== undefined) {
          updateData.encryptedPassword = encryptPassword(updates.password);
        }
        if (updates.notes !== undefined) updateData.notes = updates.notes;
        if (updates.category !== undefined) updateData.category = updates.category;
        if (updates.tags !== undefined) {
          updateData.tags = updates.tags ? JSON.stringify(updates.tags) : null;
        }
        if (updates.favorite !== undefined) {
          updateData.favorite = updates.favorite ? 1 : 0;
        }

        await updateVaultEntry(id, ctx.user.id, updateData);

        return { success: true };
      } catch (error) {
        console.error('Failed to update vault entry:', error);
        throw new Error('Failed to update vault entry');
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const entry = await getVaultEntryById(input.id, ctx.user.id);
        if (!entry) {
          throw new Error('Vault entry not found');
        }

        await deleteVaultEntry(input.id, ctx.user.id);
        return { success: true };
      } catch (error) {
        console.error('Failed to delete vault entry:', error);
        throw new Error('Failed to delete vault entry');
      }
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const entries = await getUserVaultEntries(ctx.user.id);
      const query = input.query.toLowerCase();

      return entries
        .filter(
          entry =>
            entry.title.toLowerCase().includes(query) ||
            (entry.website?.toLowerCase().includes(query) ?? false) ||
            (entry.username?.toLowerCase().includes(query) ?? false) ||
            (entry.email?.toLowerCase().includes(query) ?? false)
        )
        .map(entry => ({
          id: entry.id,
          title: entry.title,
          website: entry.website,
          username: entry.username,
          email: entry.email,
          category: entry.category,
          tags: entry.tags ? JSON.parse(entry.tags) : [],
          favorite: entry.favorite === 1,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        }));
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const entries = await getUserVaultEntries(ctx.user.id);

    let weakCount = 0;
    let reusedCount = 0;
    let oldCount = 0;

    const passwordMap = new Map<string, number>();

    for (const entry of entries) {
      try {
        const decrypted = decryptPassword(entry.encryptedPassword);
        const analysis = analyzePasswordStrength(decrypted);

        if (analysis.isWeak) weakCount++;
        if (isOldPassword(entry.createdAt, 90)) oldCount++;

        const count = passwordMap.get(decrypted) || 0;
        passwordMap.set(decrypted, count + 1);
      } catch (error) {
        console.error('Failed to analyze password:', error);
      }
    }

    passwordMap.forEach(count => {
      if (count > 1) reusedCount++;
    })

    const securityScore = calculateVaultSecurityScore(
      entries.length,
      weakCount,
      reusedCount,
      oldCount
    );

    return {
      totalPasswords: entries.length,
      weakPasswords: weakCount,
      reusedPasswords: reusedCount,
      oldPasswords: oldCount,
      securityScore: securityScore.score,
      securityLevel: securityScore.level,
      recentEntries: entries
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map(entry => ({
          id: entry.id,
          title: entry.title,
          website: entry.website,
          createdAt: entry.createdAt,
        })),
    };
  }),
});
