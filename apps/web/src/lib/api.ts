const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface HealthResponse {
  status: string;
  timestamp: string;
  database: 'connected' | 'disconnected' | string;
  error?: string | null;
  uptime: number;
}

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) {
      throw new Error(`Health check failed with status: ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error?.message || 'Failed to reach API server',
      uptime: 0,
    };
  }
}

