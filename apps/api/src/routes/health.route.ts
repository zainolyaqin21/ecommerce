import { Elysia } from "elysia";
import { HealthService } from "../services/health.service";

export const healthRoutes = new Elysia({ prefix: "/health" }).get(
  "",
  async () => {
    return HealthService.checkHealth();
  },
  {
    detail: {
      tags: ["System"],
      summary: "System and Database Health Check",
    },
  }
);

