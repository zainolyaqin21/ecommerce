<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import { authState } from "$lib/state/auth.svelte";

  let categories = $state<any[]>([]);
  let featuredProducts = $state<any[]>([]);
  let loading = $state(true);
  let errorMsg = $state("");

  async function loadHomeData() {
    loading = true;
    errorMsg = "";
    try {
      const [catRes, prodRes] = await Promise.all([
        api.categories.get(),
        api.products.get(),
      ]);

      if (catRes.data?.data) {
        categories = catRes.data.data;
      }
      if (prodRes.data?.data) {
        featuredProducts = prodRes.data.data.slice(0, 8);
      }
    } catch (e: any) {
      errorMsg = e?.message || "Gagal memuat data beranda";
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadHomeData();
  });
</script>

<svelte:head>
  <title>E-Commerce Store | Belanja Mudah & Lengkap</title>
</svelte:head>

<div class="homepage">
  <!-- Hero Section -->
  <section class="hero-section">
    <div class="hero-content">
      <span class="badge-pill">✨ Koleksi Terbaru 2026</span>
      <h1>Temukan Produk Terbaik dengan Pilihan Varian Lengkap</h1>
      <p class="hero-desc">
        Pusat perbelanjaan online modern dengan varian produk warna, ukuran, dan spesifikasi terakurat.
      </p>
      <div class="hero-cta">
        <a href="/products" class="btn btn-primary btn-lg">Jelajahi Katalog</a>
        {#if !authState.user}
          <a href="/register" class="btn btn-outline btn-lg">Daftar Sekarang</a>
        {/if}
      </div>
    </div>
  </section>

  <!-- Categories Section -->
  <section class="section container">
    <div class="section-header">
      <h2>Kategori Pilihan</h2>
      <a href="/products" class="link-more">Lihat Semua Kategori &rarr;</a>
    </div>

    {#if loading}
      <div class="skeleton-grid">
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      </div>
    {:else if categories.length === 0}
      <div class="empty-box">Belum ada kategori yang ditambahkan.</div>
    {:else}
      <div class="category-grid">
        {#each categories as category}
          <a href="/products?categoryId={category.id}" class="category-card">
            <span class="category-icon">📁</span>
            <h3>{category.name}</h3>
          </a>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Featured Products Section -->
  <section class="section container">
    <div class="section-header">
      <h2>Produk Unggulan</h2>
      <a href="/products" class="link-more">Semua Produk &rarr;</a>
    </div>

    {#if loading}
      <div class="products-grid">
        <div class="skeleton-prod"></div>
        <div class="skeleton-prod"></div>
        <div class="skeleton-prod"></div>
        <div class="skeleton-prod"></div>
      </div>
    {:else if featuredProducts.length === 0}
      <div class="empty-box">Belum ada produk unggulan saat ini.</div>
    {:else}
      <div class="products-grid">
        {#each featuredProducts as product}
          <a href="/products/{product.slug}" class="product-card">
            <div class="product-image">
              {#if product.imageUrl}
                <img src={product.imageUrl} alt={product.name} />
              {:else}
                <div class="image-placeholder">🛍️</div>
              {/if}
            </div>
            <div class="product-info">
              {#if product.categoryName}
                <span class="product-category">{product.categoryName}</span>
              {/if}
              <h3 class="product-title">{product.name}</h3>
              <div class="product-footer">
                <span class="product-price">Rp {Number(product.price).toLocaleString("id-ID")}</span>
                <span class="stock-badge {product.stock > 0 ? 'in-stock' : 'out-stock'}">
                  {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
                </span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  .homepage {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    padding-bottom: 4rem;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    width: 100%;
  }

  .hero-section {
    background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
    padding: 5rem 1.5rem;
    text-align: center;
    border-bottom: 1px solid #e2e8f0;
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .badge-pill {
    display: inline-block;
    padding: 0.35rem 0.9rem;
    background: #dbeafe;
    color: #1e40af;
    font-size: 0.85rem;
    font-weight: 600;
    border-radius: 9999px;
    margin-bottom: 1.25rem;
  }

  .hero-section h1 {
    font-size: 2.75rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
    margin-bottom: 1rem;
  }

  .hero-desc {
    font-size: 1.15rem;
    color: #475569;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .hero-cta {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .section-header h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
  }

  .link-more {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .link-more:hover {
    text-decoration: underline;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.25rem;
  }

  .category-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1.5rem 1rem;
    text-align: center;
    text-decoration: none;
    color: #1e293b;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }

  .category-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    border-color: #93c5fd;
  }

  .category-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    display: block;
  }

  .category-card h3 {
    font-size: 1rem;
    font-weight: 600;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .product-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  }

  .product-image {
    width: 100%;
    height: 180px;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-placeholder {
    font-size: 3rem;
  }

  .product-info {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .product-category {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #64748b;
    font-weight: 600;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }

  .product-title {
    font-size: 1.05rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.75rem;
  }

  .product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }

  .product-price {
    font-size: 1.1rem;
    font-weight: 700;
    color: #0f172a;
  }

  .stock-badge {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 9999px;
    font-weight: 600;
  }

  .stock-badge.in-stock {
    background: #dcfce7;
    color: #166534;
  }

  .stock-badge.out-stock {
    background: #fee2e2;
    color: #991b1b;
  }

  .empty-box {
    padding: 3rem;
    text-align: center;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    border-radius: 0.75rem;
    color: #64748b;
  }

  .btn {
    padding: 0.6rem 1.25rem;
    border-radius: 0.5rem;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .btn-lg {
    padding: 0.85rem 1.75rem;
    font-size: 1.05rem;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-primary:hover {
    background: #1d4ed8;
  }

  .btn-outline {
    background: white;
    border: 1px solid #cbd5e1;
    color: #334155;
  }

  .btn-outline:hover {
    background: #f8fafc;
  }
</style>
