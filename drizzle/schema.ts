import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Vault entries table for storing encrypted passwords and credentials.
 * Each entry is associated with a user and contains AES-256 encrypted password data.
 */
export const vaultEntries = mysqlTable("vault_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  website: varchar("website", { length: 500 }),
  username: varchar("username", { length: 255 }),
  email: varchar("email", { length: 320 }),
  encryptedPassword: text("encryptedPassword").notNull(),
  notes: text("notes"),
  category: varchar("category", { length: 100 }).default("Personal"),
  tags: text("tags"), // JSON array stored as text
  favorite: int("favorite").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VaultEntry = typeof vaultEntries.$inferSelect;
export type InsertVaultEntry = typeof vaultEntries.$inferInsert;

/**
 * Password health cache table for storing password strength analysis results.
 * Updated periodically to track weak passwords, reused passwords, and overall security score.
 */
export const passwordHealthCache = mysqlTable("password_health_cache", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  vaultEntryId: int("vaultEntryId"),
  strengthScore: int("strengthScore").default(0),
  isWeak: int("isWeak").default(0),
  isReused: int("isReused").default(0),
  isOld: int("isOld").default(0),
  recommendation: text("recommendation"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PasswordHealthCache = typeof passwordHealthCache.$inferSelect;
export type InsertPasswordHealthCache = typeof passwordHealthCache.$inferInsert;