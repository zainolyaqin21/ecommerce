import { Elysia } from "elysia";
import { healthRoutes } from "./health.route";
import { userRoutes } from "./user.route";
import { authRoutes } from "./auth.route";
import { categoryRoutes } from "./category.route";
import { productRoutes } from "./product.route";

export const appRoutes = new Elysia()
  .use(healthRoutes)
  .use(userRoutes)
  .use(authRoutes)
  .use(categoryRoutes)
  .use(productRoutes);
