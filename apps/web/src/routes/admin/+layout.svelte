<script lang="ts">
  import { onMount } from "svelte";
  import { authState } from "$lib/state/auth.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import type { Snippet } from "svelte";

  let { children }: { children?: Snippet } = $props();

  onMount(() => {
    if (!authState.loading && (!authState.user || !authState.isAdmin)) {
      goto("/login");
    }
  });

  $effect(() => {
    if (!authState.loading && (!authState.user || !authState.isAdmin)) {
      goto("/login");
    }
  });
</script>

<div class="admin-shell">
  <!-- Admin Sidebar Navigation -->
  <aside class="admin-sidebar">
    <div class="sidebar-brand">
      <span class="icon">👑</span>
      <div>
        <h3>Panel Admin</h3>
        <p>E-Commerce Hub</p>
      </div>
    </div>

    <nav class="sidebar-nav">
      <a
        href="/admin"
        class="nav-link {page.url.pathname === '/admin' ? 'active' : ''}"
      >
        <span class="icon">📊</span> Ringkasan
      </a>
      <a
        href="/admin/categories"
        class="nav-link {page.url.pathname.startsWith('/admin/categories') ? 'active' : ''}"
      >
        <span class="icon">📁</span> Kategori Produk
      </a>
      <a
        href="/admin/products"
        class="nav-link {page.url.pathname.startsWith('/admin/products') ? 'active' : ''}"
      >
        <span class="icon">🛍️</span> Produk & Varian
      </a>
    </nav>

    <div class="sidebar-footer">
      <a href="/" class="btn-back">
        &larr; Kembali ke Toko
      </a>
    </div>
  </aside>

  <!-- Admin Main Content View -->
  <main class="admin-main">
    {#if children}
      {@render children()}
    {/if}
  </main>
</div>

<style>
  .admin-shell {
    display: flex;
    min-height: calc(100vh - 65px);
    background: #f8fafc;
  }

  .admin-sidebar {
    width: 260px;
    background: #ffffff;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    padding: 1.5rem 1rem;
  }

  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-bottom: 1.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .sidebar-brand .icon {
    font-size: 2rem;
  }

  .sidebar-brand h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .sidebar-brand p {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex-grow: 1;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 1rem;
    border-radius: 0.5rem;
    color: #475569;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.2s;
  }

  .nav-link:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  .nav-link.active {
    background: #eff6ff;
    color: #2563eb;
  }

  .sidebar-footer {
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
  }

  .btn-back {
    display: block;
    text-align: center;
    padding: 0.6rem;
    background: #f1f5f9;
    color: #334155;
    text-decoration: none;
    border-radius: 0.375rem;
    font-weight: 600;
    font-size: 0.85rem;
  }

  .admin-main {
    flex: 1;
    padding: 2.5rem;
    overflow-y: auto;
  }
</style>
