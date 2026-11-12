import { Elysia } from "elysia";
import { UserService } from "../services/user.service";

export const userRoutes = new Elysia({ prefix: "/api/users" }).get(
  "",
  async () => {
    try {
      const allUsers = await UserService.getAllUsers();
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
);

