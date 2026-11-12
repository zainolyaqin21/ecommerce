import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { db, users } from "@ecommerce/db";
import { sql } from "drizzle-orm";

const port = Number(process.env.PORT) || 3001;

export const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "E-Commerce API",
          version: "1.0.0",
          description: "RESTful API Backend built with Elysia and Drizzle ORM",
        },
        tags: [
          { name: "System", description: "Health & System diagnostic endpoints" },
          { name: "Users", description: "User management endpoints" },
        ],
      },
    })
  )
  .get(
    "/",
    () => ({
      name: "E-Commerce API",
      status: "running",
      documentation: "/swagger",
    }),
    {
      detail: {
        tags: ["System"],
        summary: "API Root index",
      },
    }
  )
  .get(
    "/health",
    async () => {
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
    },
    {
      detail: {
        tags: ["System"],
        summary: "System and Database Health Check",
      },
    }
  )
  .get(
    "/api/users",
    async () => {
      try {
        const allUsers = await db.select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
        }).from(users);

        return {
          success: true,
          data: allUsers,
        };
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || "Could not fetch users",
        };
      }
    },
    {
      detail: {
        tags: ["Users"],
        summary: "List users",
      },
    }
  )
  .listen(port);

console.log(`🦊 Elysia is running at http://${app.server?.hostname || "localhost"}:${app.server?.port || port}`);
console.log(`📚 Swagger documentation at http://localhost:${port}/swagger`);

export type App = typeof app;

