<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchHealth, type HealthResponse } from '$lib/api';

  let healthData: HealthResponse | null = $state(null);
  let loading = $state(true);
  let errorMsg = $state('');

  async function checkBackend() {
    loading = true;
    errorMsg = '';
    try {
      healthData = await fetchHealth();
    } catch (e: any) {
      errorMsg = e?.message || 'Error fetching health status';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    checkBackend();
  });
</script>

<svelte:head>
  <title>E-Commerce Workspace | Full-Stack Setup</title>
</svelte:head>

<main class="container">
  <header class="header">
    <div class="badge">Monorepo Ready</div>
    <h1>E-Commerce Architecture</h1>
    <p class="subtitle">
      Powered by <strong>Bun</strong>, <strong>SvelteKit</strong>, <strong>Elysia.js</strong>, <strong>MySQL</strong> & <strong>Drizzle ORM</strong>
    </p>
  </header>

  <div class="grid">
    <!-- Card 1: Frontend -->
    <div class="card active">
      <div class="card-icon">⚡</div>
      <h2>Frontend (SvelteKit)</h2>
      <p>Aplikasi web modern berjalan di port <code>3000</code>.</p>
      <div class="status-pill success">Status: Active</div>
    </div>

    <!-- Card 2: Backend -->
    <div class="card">
      <div class="card-icon">🦊</div>
      <h2>Backend (Elysia.js)</h2>
      <p>Server API performa tinggi berjalan di port <code>3001</code>.</p>
      {#if loading}
        <div class="status-pill loading">Checking API...</div>
      {:else if healthData && healthData.status === 'ok'}
        <div class="status-pill success">Status: Online (Uptime: {Math.floor(healthData.uptime)}s)</div>
      {:else}
        <div class="status-pill error">Status: Offline / Error</div>
      {/if}
    </div>

    <!-- Card 3: Database -->
    <div class="card">
      <div class="card-icon">🗄️</div>
      <h2>Database (MySQL + Drizzle)</h2>
      <p>Koneksi pool MySQL & Type-Safe queries via Drizzle ORM.</p>
      {#if loading}
        <div class="status-pill loading">Checking DB...</div>
      {:else if healthData?.database === 'connected'}
        <div class="status-pill success">Database: Connected</div>
      {:else}
        <div class="status-pill warning">Database: Disconnected</div>
      {/if}
    </div>
  </div>

  <section class="action-section">
    <button class="btn" onclick={checkBackend} disabled={loading}>
      {loading ? 'Memeriksa...' : '🔄 Refresh Status'}
    </button>
    <a href="http://localhost:3001/swagger" target="_blank" rel="noreferrer" class="btn btn-secondary">
      📖 Buka Swagger API Docs
    </a>
  </section>

  {#if healthData}
    <section class="diagnostic">
      <h3>Hasil Diagnostik Backend (/health):</h3>
      <pre>{JSON.stringify(healthData, null, 2)}</pre>
    </section>
  {/if}
</main>

<style>
  .container {
    max-width: 960px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .header {
    text-align: center;
  }

  .badge {
    display: inline-block;
    background: rgba(99, 102, 241, 0.2);
    color: #818cf8;
    border: 1px solid rgba(99, 102, 241, 0.4);
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    margin-bottom: 0.75rem;
  }

  h1 {
    font-size: 2.5rem;
    margin: 0.5rem 0;
    background: linear-gradient(to right, #ffffff, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    color: #94a3b8;
    font-size: 1.1rem;
    margin: 0;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
  }

  .card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: transform 0.2s ease, border-color 0.2s ease;
  }

  .card:hover {
    transform: translateY(-2px);
    border-color: #6366f1;
  }

  .card-icon {
    font-size: 2rem;
  }

  .card h2 {
    font-size: 1.25rem;
    margin: 0;
  }

  .card p {
    font-size: 0.95rem;
    color: #94a3b8;
    margin: 0;
    flex-grow: 1;
  }

  code {
    background: #0f172a;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    color: #38bdf8;
  }

  .status-pill {
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.4rem 0.75rem;
    border-radius: 6px;
    width: fit-content;
  }

  .status-pill.success {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .status-pill.warning {
    background: rgba(234, 179, 8, 0.2);
    color: #facc15;
    border: 1px solid rgba(234, 179, 8, 0.3);
  }

  .status-pill.error {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .status-pill.loading {
    background: rgba(148, 163, 184, 0.2);
    color: #cbd5e1;
  }

  .action-section {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .btn {
    background: #4f46e5;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s ease;
  }

  .btn:hover {
    background: #4338ca;
  }

  .btn-secondary {
    background: #334155;
  }

  .btn-secondary:hover {
    background: #475569;
  }

  .diagnostic {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .diagnostic h3 {
    margin-top: 0;
    font-size: 1.1rem;
    color: #cbd5e1;
  }

  pre {
    background: #0f172a;
    padding: 1rem;
    border-radius: 8px;
    color: #38bdf8;
    overflow-x: auto;
    font-size: 0.9rem;
    margin: 0;
  }
</style>

