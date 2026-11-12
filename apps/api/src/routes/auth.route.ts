import { Elysia, t } from "elysia";
import { AuthService } from "../services/auth.service";

export const authRoutes = new Elysia({ prefix: "/auth" })
  /**
   * POST /auth/register
   * Mendaftarkan pengguna baru dengan role default customer
   */
  .post(
    "/register",
    async ({ body, set }) => {
      try {
        const user = await AuthService.register({
          name: body.name,
          email: body.email,
          password: body.password,
        });

        set.status = 201;
        return {
          success: true,
          message: "Registration successful",
          data: user,
        };
      } catch (err: any) {
        set.status = 400;
        return {
          success: false,
          error: err?.message || "Registration failed",
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2, description: "Full name" }),
        email: t.String({ format: "email", description: "Email address" }),
        password: t.String({ minLength: 6, description: "Password minimum 6 characters" }),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Register new customer account",
      },
    }
  )

  /**
   * POST /auth/login
   * Autentikasi pengguna & inisialisasi session
   */
  .post(
    "/login",
    async ({ body, cookie: { sessionId }, set }) => {
      try {
        const result = await AuthService.login({
          email: body.email,
          password: body.password,
        });

        // Set session ID ke HTTP-only cookie
        sessionId.set({
          value: result.sessionId,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: result.expiresAt,
        });

        return {
          success: true,
          message: "Login successful",
          data: {
            sessionId: result.sessionId,
            user: result.user,
          },
        };
      } catch (err: any) {
        set.status = 401;
        return {
          success: false,
          error: err?.message || "Invalid credentials",
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Login and create session",
      },
    }
  )

  /**
   * GET /auth/me
   * Memvalidasi dan mengembalikan info session aktif
   */
  .get(
    "/me",
    async ({ cookie: { sessionId }, headers, set }) => {
      // Izinkan session ID dari cookie atau Authorization header: Bearer <sessionId>
      let token: string | undefined = typeof sessionId.value === "string" ? sessionId.value : undefined;
      if (!token && headers.authorization?.startsWith("Bearer ")) {
        token = headers.authorization.slice(7).trim();
      }

      if (!token) {
        set.status = 401;
        return {
          success: false,
          error: "Unauthorized: No active session",
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

      return {
        success: true,
        data: session,
      };
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Get current session profile",
      },
    }
  )

  /**
   * POST /auth/logout
   * Menghapus session saat pengguna keluar
   */
  .post(
    "/logout",
    async ({ cookie: { sessionId }, headers }) => {
      let token: string | undefined = typeof sessionId.value === "string" ? sessionId.value : undefined;
      if (!token && headers.authorization?.startsWith("Bearer ")) {
        token = headers.authorization.slice(7).trim();
      }

      if (token) {
        await AuthService.logout(token);
      }

      // Bersihkan cookie
      sessionId.remove();

      return {
        success: true,
        message: "Logged out successfully",
      };
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Logout and destroy active session",
      },
    }
  );
