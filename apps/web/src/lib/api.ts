import { treaty } from "@elysiajs/eden";
import type { App } from "api/src/index";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
}

export const api = treaty<App>(API_BASE_URL, {
  fetch: {
    credentials: "include",
  },
  headers: () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

/**
 * Helper to upload image file to backend with magic-byte validation
 */
export async function uploadImageFile(file: File, token?: string | null): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const activeToken = token || getAuthToken();
  const headers: Record<string, string> = {};
  if (activeToken) {
    headers["Authorization"] = `Bearer ${activeToken}`;
  }

  const res = await fetch(`${API_BASE_URL}/upload/image`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Gagal mengunggah gambar");
  }

  return json.data.url;
}

/**
 * Returns full URL if image path is relative (e.g. /public/uploads/...)
 */
export function getImageUrl(path?: string | null): string {
  if (!path) return "https://placehold.co/400x400?text=No+Image";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
