<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import { authState } from "$lib/state/auth.svelte";

  let healthData = $state<{
    status: string;
    database: string;
    error: string | null;
    uptime: number;
  } | null>(null);
  let loading = $state(true);
  let errorMsg = $state("");

  async function checkBackend() {
    loading = true;
    errorMsg = "";
    try {
      const { data, error } = await api.health.get();
      if (error || !data) {
        errorMsg = "Gagal memanggil endpoint /health";
      } else {
        healthData = data;
      }
    } catch (e: any) {
      errorMsg = e?.message || "Error saat menghubungi API server";
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    checkBackend();
  });
</script>

<svelte:head>
  <title>E-Commerce Workspace | Home</title>
</svelte:head>

<div class="container">
  <header class="header">
    <div class="badge">Svelte 5 + Eden Treaty Ready</div>
    <h1>E-Commerce Storefront</h1>
    <p class="subtitle">
      Powered by <strong>Bun Workspace</strong>, <strong>SvelteKit (Svelte 5)</strong>, <strong>Elysia.js</strong> & <strong>Eden Treaty</strong>
    </p>

    {#if authState.user}
      <div class="welcome-box">
        <h3>Halo, {authState.user.name}! 👋</h3>
        <p>Anda masuk sebagai <strong class="capitalize">{authState.user.role}</strong> ({authState.user.email}).</p>
      </div>
    {:else}
      <div class="guest-box">
        <p>Selamat datang di platform e-commerce kami. Silakan masuk untuk mendapatkan pengalaman penuh.</p>
        <div class="guest-cta">
          <a href="/login" class="btn btn-primary">Masuk ke Akun</a>
          <a href="/register" class="btn btn-outline">Daftar Akun Baru</a>
        </div>
      </div>
    {/if}
  </header>

  <div class="grid">
    <!-- Card 1: Frontend Status -->
    <div class="card active">
      <div class="card-icon">⚡</div>
      <h2>Frontend (SvelteKit + Svelte 5)</h2>
      <p>Aplikasi web modern menggunakan Svelte 5 Runes & Eden Treaty.</p>
      <div class="status-pill success">Status: Active (Port 3000)</div>
    </div>

    <!-- Card 2: Backend Status via Eden -->
    <div class="card">
      <div class="card-icon">🦊</div>
      <h2>Backend (Elysia.js)</h2>
      <p>High performance TypeScript API framework.</p>
      {#if loading}
        <div class="status-pill loading">Memeriksa status...</div>
      {:else if healthData}
        <div class="status-pill success">Status: Connected ({healthData.status})</div>
        <div class="uptime-text">Uptime: {Math.round(healthData.uptime)}s</div>
      {:else}
        <div class="status-pill error">Status: Disconnected</div>
        {#if errorMsg}
          <div class="error-detail">{errorMsg}</div>
        {/if}
      {/if}
    </div>

    <!-- Card 3: Database -->
    <div class="card">
      <div class="card-icon">🗄️</div>
      <h2>Database (MySQL + Drizzle)</h2>
      <p>Type-safe ORM terhubung ke server database MySQL.</p>
      {#if loading}
        <div class="status-pill loading">Memeriksa database...</div>
      {:else if healthData && healthData.database === "connected"}
        <div class="status-pill success">Database: Connected</div>
      {:else}
        <div class="status-pill error">Database: Disconnected</div>
      {/if}
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
    width: 100%;
  }

  .header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .badge {
    display: inline-block;
    padding: 0.35rem 0.85rem;
    background: #e0e7ff;
    color: #4338ca;
    font-size: 0.85rem;
    font-weight: 600;
    border-radius: 9999px;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 0.75rem 0;
    color: #0f172a;
  }

  .subtitle {
    font-size: 1.1rem;
    color: #64748b;
    margin: 0 0 2rem 0;
  }

  .welcome-box {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    padding: 1.5rem;
    max-width: 500px;
    margin: 0 auto;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .welcome-box h3 {
    margin: 0 0 0.5rem 0;
    color: #1e293b;
  }

  .welcome-box p {
    margin: 0;
    color: #475569;
  }

  .guest-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 1.75rem;
    max-width: 550px;
    margin: 0 auto;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .guest-box p {
    margin: 0 0 1.25rem 0;
    color: #475569;
  }

  .guest-cta {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .card-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .card h2 {
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
    color: #1e293b;
  }

  .card p {
    color: #64748b;
    font-size: 0.95rem;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
  }

  .status-pill {
    padding: 0.4rem 0.85rem;
    border-radius: 9999px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .status-pill.success {
    background: #dcfce7;
    color: #166534;
  }

  .status-pill.loading {
    background: #f1f5f9;
    color: #64748b;
  }

  .status-pill.error {
    background: #fee2e2;
    color: #991b1b;
  }

  .uptime-text {
    margin-top: 0.75rem;
    font-size: 0.85rem;
    color: #94a3b8;
  }

  .error-detail {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #ef4444;
  }

  .capitalize {
    text-transform: capitalize;
  }

  .btn {
    padding: 0.6rem 1.25rem;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s ease;
  }

  .btn-primary {
    background: #2563eb;
    color: #ffffff;
  }

  .btn-primary:hover {
    background: #1d4ed8;
  }

  .btn-outline {
    background: transparent;
    border-color: #cbd5e1;
    color: #334155;
  }

  .btn-outline:hover {
    background: #f8fafc;
  }
</style>
