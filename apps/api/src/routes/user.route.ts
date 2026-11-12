import { Elysia } from "elysia";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";

export const userRoutes = new Elysia({ prefix: "/api/users" }).get(
  "",
  async ({ cookie: { sessionId }, headers, set }) => {
    // Session Guard: Memeriksa session aktif dari cookie atau Authorization header
    let token: string | undefined = typeof sessionId.value === "string" ? sessionId.value : undefined;
    if (!token && headers.authorization?.startsWith("Bearer ")) {
      token = headers.authorization.slice(7).trim();
    }

    if (!token) {
      set.status = 401;
      return {
        success: false,
        error: "Unauthorized: Active session required",
      };
    }

    const session = await AuthService.validateSession(token);
    if (!session) {
      set.status = 401;
      return {
        success: false,
        error: "Unauthorized: Session invalid or expired",
      };
    }

    try {
      const allUsers = await UserService.getAllUsers();
      return {
        success: true,
        data: allUsers,
      };
    } catch (err: any) {
      set.status = 500;
      return {
        success: false,
        error: err?.message || "Could not fetch users",
      };
    }
  },
  {
    detail: {
      tags: ["Users"],
      summary: "List users (Protected - requires active session)",
    },
  }
);
