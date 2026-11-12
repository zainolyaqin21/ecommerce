import { db, users } from "@ecommerce/db";
import { sql } from "drizzle-orm";

export class HealthService {
  static async checkHealth() {
    let databaseStatus = "disconnected";
    let dbError: string | null = null;

    try {
      await db.execute(sql`SELECT 1`);
      databaseStatus = "connected";
    } catch (err: any) {
      dbError = err?.message || "Failed to query database";
    }

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: databaseStatus,
      error: dbError,
      uptime: process.uptime(),
    };
  }
}
