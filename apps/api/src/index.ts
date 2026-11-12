import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { appRoutes } from "./routes";

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
  .use(appRoutes)
  .listen(port);

console.log(`🦊 Elysia is running at http://${app.server?.hostname || "localhost"}:${app.server?.port || port}`);
console.log(`📚 Swagger documentation at http://localhost:${port}/swagger`);
