import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/dev-login", async (req: Request, res: Response) => {
    try {
      const openId = "local-dev-user";
      const db = await getDb();
      if (db) {
        await db.execute(sql`
          INSERT INTO users (openId, name, email, loginMethod, role, lastSignedIn)
          VALUES ('local-dev-user', 'Dev User', 'dev@localhost.com', 'dev', 'admin', NOW())
          ON DUPLICATE KEY UPDATE lastSignedIn = NOW()
        `);
      }
      const sessionToken = await sdk.createSessionToken(openId, { name: "Dev User", expiresInMs: ONE_YEAR_MS });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[DevLogin] Failed:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ error: "Name, email and password are required" });
        return;
      }
      const db = await getDb();
      if (!db) { res.status(500).json({ error: "DB not available" }); return; }

      const existing = await db.execute(sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`) as any;
      if (existing?.[0]?.length > 0) {
        res.status(400).json({ error: "Email already registered" });
        return;
      }

      const crypto = await import("crypto");
      const salt = crypto.randomBytes(16).toString("hex");
      const hash = crypto.scryptSync(password, salt, 64).toString("hex");
      const openId = `local_${crypto.randomBytes(8).toString("hex")}`;

      await db.execute(sql`
        INSERT INTO users (openId, name, email, loginMethod, role, lastSignedIn)
        VALUES (${openId}, ${name}, ${email}, ${`${salt}:${hash}`}, 'user', NOW())
      `);

      const sessionToken = await sdk.createSessionToken(openId, { name, expiresInMs: ONE_YEAR_MS });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true });
    } catch (error) {
      console.error("[Register] Failed:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }
      const db = await getDb();
      if (!db) { res.status(500).json({ error: "DB not available" }); return; }

      const rows = await db.execute(sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`) as any;
      const user = rows?.[0]?.[0];
      console.log("[Login] user found:", !!user, "loginMethod:", user?.loginMethod?.slice(0, 20));
      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const crypto = await import("crypto");
      const [salt, storedHash] = user.loginMethod.split(":");
      const hash = crypto.scryptSync(password, salt, 64).toString("hex");
      console.log("[Login] hash match:", hash === storedHash);
      if (hash !== storedHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      await db.execute(sql`UPDATE users SET lastSignedIn = NOW() WHERE id = ${user.id}`);
      const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name, expiresInMs: ONE_YEAR_MS });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true });
    } catch (error) {
      console.error("[Login] Failed:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.post("/api/auth/verify-password", async (req: Request, res: Response) => {
    try {
      const { password } = req.body;
      const rawCookies = req.headers.cookie || '';
      const cookieMap = new Map(rawCookies.split(';').map(c => {
        const [k, ...v] = c.trim().split('=');
        return [k, v.join('=')];
      }));
      const cookie = cookieMap.get(COOKIE_NAME);
      if (!cookie) { res.status(401).json({ valid: false }); return; }

      const session = await sdk.verifySession(cookie);
      if (!session?.openId) { res.status(401).json({ valid: false }); return; }

      const db = await getDb();
      if (!db) { res.status(500).json({ valid: false }); return; }

      const rows = await db.execute(sql`SELECT loginMethod FROM users WHERE openId = ${session.openId} LIMIT 1`) as any;
      const user = rows?.[0]?.[0];
      if (!user) { res.status(401).json({ valid: false }); return; }

      const crypto = await import("crypto");
      const [salt, storedHash] = user.loginMethod.split(":");
      const hash = crypto.scryptSync(password, salt, 64).toString("hex");
      res.json({ valid: hash === storedHash });
    } catch (error) {
      console.error("[VerifyPassword] Failed:", error);
      res.status(500).json({ valid: false });
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      const db = await getDb();
      if (db) {
        await db.execute(sql`
          INSERT INTO users (openId, name, email, loginMethod, lastSignedIn)
          VALUES (${userInfo.openId}, ${userInfo.name || null}, ${userInfo.email ?? null}, ${userInfo.loginMethod ?? null}, NOW())
          ON DUPLICATE KEY UPDATE lastSignedIn = NOW()
        `);
      }
      const sessionToken = await sdk.createSessionToken(userInfo.openId, { name: userInfo.name || "", expiresInMs: ONE_YEAR_MS });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}