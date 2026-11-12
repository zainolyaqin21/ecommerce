import { api } from "$lib/api";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
}

class AuthState {
  user = $state<UserProfile | null>(null);
  loading = $state<boolean>(true);
  error = $state<string | null>(null);

  get isAuthenticated(): boolean {
    return this.user !== null;
  }

  get isAdmin(): boolean {
    return this.user?.role === "admin";
  }

  /**
   * Cek sesi aktif saat aplikasi dimuat atau di-refresh
   */
  async checkSession() {
    this.loading = true;
    this.error = null;
    try {
      const { data, error } = await api.auth.me.get();

      if (error || !data?.success || !data?.data) {
        this.user = null;
      } else {
        this.user = data.data.user as UserProfile;
      }
    } catch (err: any) {
      this.user = null;
      this.error = err?.message || "Failed to verify session";
    } finally {
      this.loading = false;
    }
  }

  /**
   * Login user dengan kredensial
   */
  async login(credentials: { email: string; password: string }) {
    this.loading = true;
    this.error = null;
    try {
      const { data, error } = await api.auth.login.post({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        const errorMsg =
          typeof error.value === "object" && error.value !== null && "error" in error.value
            ? String((error.value as any).error)
            : "Login failed";
        this.error = errorMsg;
        return { success: false, error: errorMsg };
      }

      if (data?.success && data?.data?.user) {
        this.user = data.data.user as UserProfile;
        return { success: true };
      }

      return { success: false, error: "Login failed" };
    } catch (err: any) {
      const msg = err?.message || "Failed to communicate with login server";
      this.error = msg;
      return { success: false, error: msg };
    } finally {
      this.loading = false;
    }
  }

  /**
   * Registrasi user baru (role default: customer)
   */
  async register(payload: { name: string; email: string; password: string }) {
    this.loading = true;
    this.error = null;
    try {
      const { data, error } = await api.auth.register.post({
        name: payload.name,
        email: payload.email,
        password: payload.password,
      });

      if (error) {
        const errorMsg =
          typeof error.value === "object" && error.value !== null && "error" in error.value
            ? String((error.value as any).error)
            : "Registration failed";
        this.error = errorMsg;
        return { success: false, error: errorMsg };
      }

      if (data?.success) {
        return { success: true };
      }

      return { success: false, error: "Registration failed" };
    } catch (err: any) {
      const msg = err?.message || "Failed to communicate with registration server";
      this.error = msg;
      return { success: false, error: msg };
    } finally {
      this.loading = false;
    }
  }

  /**
   * Logout user dan bersihkan sesi
   */
  async logout() {
    this.loading = true;
    try {
      await api.auth.logout.post();
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      this.user = null;
      this.loading = false;
    }
  }
}

export const authState = new AuthState();
