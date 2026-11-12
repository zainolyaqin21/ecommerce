import { Elysia } from "elysia";
import { healthRoutes } from "./health.route";
import { userRoutes } from "./user.route";
import { authRoutes } from "./auth.route";

export const appRoutes = new Elysia()
  .use(healthRoutes)
  .use(userRoutes)
  .use(authRoutes);
