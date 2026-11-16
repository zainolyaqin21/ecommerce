import { AuthService } from "../services/auth.service";

export interface AdminAuthResult {
  isAdmin: boolean;
  user?: any;
  status: 200 | 401 | 403;
  error?: string;
}

/**
 * Helper untuk memvalidasi apakah request memiliki session aktif dan memiliki role 'admin'
 */
export async function requireAdmin(
  sessionIdCookie: unknown,
  authHeader?: string
): Promise<AdminAuthResult> {
  let token: string | undefined =
    typeof sessionIdCookie === "string" && sessionIdCookie.length > 0
      ? sessionIdCookie
      : undefined;

  if (!token && authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    return {
      isAdmin: false,
      status: 401,
      error: "Unauthorized: Active session required",
    };
  }

  const session = await AuthService.validateSession(token);
  if (!session) {
    return {
      isAdmin: false,
      status: 401,
      error: "Unauthorized: Session invalid or expired",
    };
  }

  if (session.user.role !== "admin") {
    return {
      isAdmin: false,
      status: 403,
      error: "Forbidden: Admin access required",
    };
  }

  return {
    isAdmin: true,
    user: session.user,
    status: 200,
  };
}
