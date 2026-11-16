<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";

  let totalProducts = $state(0);
  let totalCategories = $state(0);
  let loading = $state(true);

  async function loadSummary() {
    loading = true;
    try {
      const [catRes, prodRes] = await Promise.all([
        api.categories.get(),
        api.products.get(),
      ]);

      totalCategories = catRes.data?.data ? catRes.data.data.length : 0;
      totalProducts = prodRes.data?.data ? prodRes.data.data.length : 0;
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadSummary();
  });
</script>

<svelte:head>
  <title>Dashboard Admin | E-Commerce</title>
</svelte:head>

<div class="dashboard-page">
  <header class="page-header">
    <h1>Dashboard Ringkasan Admin</h1>
    <p>Selamat datang di panel pengelolaan katalog, kategori, dan stok produk.</p>
  </header>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">🛍️</div>
      <div class="stat-info">
        <span class="stat-label">Total Produk</span>
        <span class="stat-value">{loading ? "..." : totalProducts}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">📁</div>
      <div class="stat-info">
        <span class="stat-label">Total Kategori</span>
        <span class="stat-value">{loading ? "..." : totalCategories}</span>
      </div>
    </div>
  </div>

  <div class="quick-actions">
    <h2>Aksi Cepat</h2>
    <div class="actions-grid">
      <a href="/admin/products/new" class="action-card">
        <h3>➕ Tambah Produk & Varian Baru</h3>
        <p>Tambahkan produk baru beserta SKU, atribut, harga, dan stok varian.</p>
      </a>
      <a href="/admin/categories" class="action-card">
        <h3>📁 Kelola Kategori</h3>
        <p>Buat, edit nama, atau hapus kategori produk pada toko.</p>
      </a>
      <a href="/admin/products" class="action-card">
        <h3>📋 Daftar Seluruh Produk</h3>
        <p>Lihat dan kelola seluruh daftar produk yang sedang aktif.</p>
      </a>
    </div>
  </div>
</div>

<style>
  .dashboard-page {
    max-width: 1000px;
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .page-header h1 {
    font-size: 1.85rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 0.25rem;
  }

  .page-header p {
    color: #64748b;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .stat-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .stat-icon {
    font-size: 2.25rem;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 600;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 800;
    color: #0f172a;
  }

  .quick-actions h2 {
    font-size: 1.35rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1.25rem;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
  }

  .action-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1.5rem;
    text-decoration: none;
    transition: all 0.2s;
  }

  .action-card:hover {
    border-color: #93c5fd;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  }

  .action-card h3 {
    font-size: 1.05rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .action-card p {
    font-size: 0.9rem;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
  }
</style>

