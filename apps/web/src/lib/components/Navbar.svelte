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

    <div class="nav-menu">
      <a href="/" class="nav-item">Beranda</a>

      {#if authState.loading}
        <div class="nav-loading">Memeriksa sesi...</div>
      {:else if authState.user}
        {#if authState.isAdmin}
          <a href="/admin/dashboard" class="nav-item badge-admin">
            👑 Dashboard Admin
          </a>
        {/if}

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
    padding: 0.75rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    text-decoration: none;
  }

  .brand-icon {
    font-size: 1.5rem;
  }

  .nav-menu {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .nav-item {
    color: #475569;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.95rem;
    transition: color 0.15s ease;
  }

  .nav-item:hover {
    color: #2563eb;
  }

  .badge-admin {
    background: #fef3c7;
    color: #92400e;
    padding: 0.25rem 0.65rem;
    border-radius: 9999px;
    font-size: 0.85rem;
    border: 1px solid #fde68a;
  }

  .user-greeting {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.9rem;
    color: #334155;
    background: #f1f5f9;
    padding: 0.35rem 0.75rem;
    border-radius: 9999px;
  }

  .user-name {
    font-weight: 600;
  }

  .user-role-badge {
    font-size: 0.75rem;
    background: #cbd5e1;
    color: #1e293b;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    text-transform: capitalize;
  }

  .auth-buttons {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s ease;
    border: 1px solid transparent;
  }

  .btn-outline {
    background: transparent;
    border-color: #cbd5e1;
    color: #334155;
  }

  .btn-outline:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }

  .btn-primary {
    background: #2563eb;
    color: #ffffff;
  }

  .btn-primary:hover {
    background: #1d4ed8;
  }

  .nav-loading {
    font-size: 0.85rem;
    color: #94a3b8;
  }
</style>
