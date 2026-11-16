<script lang="ts">
  import { authState } from "$lib/state/auth.svelte";
  import { goto } from "$app/navigation";

  async function handleLogout() {
    await authState.logout();
    goto("/login");
  }
</script>

<nav class="navbar">
  <div class="nav-container">
    <div class="nav-brand">
      <a href="/" class="brand-link">
        <span class="brand-icon">🛍️</span>
        <span class="brand-text">E-Commerce</span>
      </a>
    </div>

    <div class="nav-links">
      <a href="/" class="nav-item">Beranda</a>
      <a href="/products" class="nav-item">Katalog Produk</a>
      {#if authState.isAdmin}
        <a href="/admin" class="nav-item badge-admin">
          👑 Panel Admin
        </a>
      {/if}
    </div>

    <div class="nav-menu">
      {#if authState.loading}
        <div class="nav-loading">Memeriksa sesi...</div>
      {:else if authState.user}
        <div class="user-greeting">
          <span class="user-avatar">👤</span>
          <span class="user-name">{authState.user.name}</span>
          <span class="user-role-badge">{authState.user.role}</span>
        </div>

        <button onclick={handleLogout} class="btn btn-outline" type="button">
          Logout
        </button>
      {:else}
        <div class="auth-buttons">
          <a href="/login" class="btn btn-outline">Login</a>
          <a href="/register" class="btn btn-primary">Register</a>
        </div>
      {/if}
    </div>
  </div>
</nav>

<style>
  .navbar {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.85rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-brand .brand-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.35rem;
    font-weight: 700;
    color: #1e293b;
    text-decoration: none;
  }

  .brand-icon {
    font-size: 1.5rem;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .nav-menu {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .nav-item {
    font-size: 0.95rem;
    font-weight: 500;
    color: #64748b;
    text-decoration: none;
    transition: color 0.2s;
  }

  .nav-item:hover {
    color: #2563eb;
  }

  .badge-admin {
    background: #fef3c7;
    color: #b45309;
    padding: 0.25rem 0.6rem;
    border-radius: 9999px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .badge-admin:hover {
    background: #fde68a;
    color: #92400e;
  }

  .nav-loading {
    font-size: 0.85rem;
    color: #94a3b8;
  }

  .user-greeting {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 9999px;
  }

  .user-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: #1e293b;
  }

  .user-role-badge {
    background: #e2e8f0;
    color: #475569;
    font-size: 0.75rem;
    padding: 0.15rem 0.4rem;
    border-radius: 9999px;
    text-transform: capitalize;
  }

  .auth-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    padding: 0.45rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    display: inline-flex;
    align-items: center;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-primary:hover {
    background: #1d4ed8;
  }

  .btn-outline {
    background: transparent;
    border: 1px solid #cbd5e1;
    color: #334155;
  }

  .btn-outline:hover {
    background: #f1f5f9;
  }
</style>
