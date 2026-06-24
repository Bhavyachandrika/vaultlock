import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, vaultEntries, passwordHealthCache, InsertVaultEntry, InsertPasswordHealthCache } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by ID.
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all vault entries for a user.
 */
export async function getUserVaultEntries(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(vaultEntries)
      .where(eq(vaultEntries.userId, userId))
      .orderBy(vaultEntries.createdAt);
  } catch (error) {
    console.error('[Database] Failed to get vault entries:', error);
    return [];
  }
}

/**
 * Get a single vault entry by ID.
 */
export async function getVaultEntryById(entryId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .select()
      .from(vaultEntries)
      .where(
        and(
          eq(vaultEntries.id, entryId),
          eq(vaultEntries.userId, userId)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error('[Database] Failed to get vault entry:', error);
    return undefined;
  }
}

/**
 * Create a new vault entry.
 */
export async function createVaultEntry(entry: InsertVaultEntry) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    const result = await db.insert(vaultEntries).values(entry);
    return result;
  } catch (error) {
    console.error('[Database] Failed to create vault entry:', error);
    throw error;
  }
}

/**
 * Update a vault entry.
 */
export async function updateVaultEntry(
  entryId: number,
  userId: number,
  updates: Partial<InsertVaultEntry>
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    await db
      .update(vaultEntries)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        and(
          eq(vaultEntries.id, entryId),
          eq(vaultEntries.userId, userId)
        )
      );
  } catch (error) {
    console.error('[Database] Failed to update vault entry:', error);
    throw error;
  }
}

/**
 * Delete a vault entry.
 */
export async function deleteVaultEntry(entryId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    await db
      .delete(vaultEntries)
      .where(
        and(
          eq(vaultEntries.id, entryId),
          eq(vaultEntries.userId, userId)
        )
      );
  } catch (error) {
    console.error('[Database] Failed to delete vault entry:', error);
    throw error;
  }
}

/**
 * Get password health cache for a user.
 */
export async function getPasswordHealthCache(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(passwordHealthCache)
      .where(eq(passwordHealthCache.userId, userId));
  } catch (error) {
    console.error('[Database] Failed to get password health cache:', error);
    return [];
  }
}

/**
 * Update password health cache entry.
 */
export async function updatePasswordHealthCache(
  userId: number,
  vaultEntryId: number,
  updates: Partial<InsertPasswordHealthCache>
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    const existing = await db
      .select()
      .from(passwordHealthCache)
      .where(
        and(
          eq(passwordHealthCache.userId, userId),
          eq(passwordHealthCache.vaultEntryId, vaultEntryId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(passwordHealthCache)
        .set({ ...updates, updatedAt: new Date() })
        .where(
          and(
            eq(passwordHealthCache.userId, userId),
            eq(passwordHealthCache.vaultEntryId, vaultEntryId)
          )
        );
    } else {
      await db.insert(passwordHealthCache).values({
        userId,
        vaultEntryId,
        ...updates,
      } as InsertPasswordHealthCache);
    }
  } catch (error) {
    console.error('[Database] Failed to update password health cache:', error);
    throw error;
  }
}
