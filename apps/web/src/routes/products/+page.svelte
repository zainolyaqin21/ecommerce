<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { api } from "$lib/api";

  let products = $state<any[]>([]);
  let categories = $state<any[]>([]);
  let loading = $state(true);
  let errorMsg = $state("");

  let searchQuery = $state("");
  let selectedCategory = $state<number | null>(null);

  async function loadData() {
    loading = true;
    errorMsg = "";
    try {
      const catIdParam = page.url.searchParams.get("categoryId");
      if (catIdParam) {
        selectedCategory = Number(catIdParam);
      }

      const [catRes, prodRes] = await Promise.all([
        api.categories.get(),
        api.products.get({
          query: {
            categoryId: selectedCategory ? selectedCategory : undefined,
            search: searchQuery.trim() !== "" ? searchQuery.trim() : undefined,
          },
        }),
      ]);

      if (catRes.data?.data) {
        categories = catRes.data.data;
      }
      if (prodRes.data?.data) {
        products = prodRes.data.data;
      }
    } catch (e: any) {
      errorMsg = e?.message || "Gagal memuat katalog produk";
    } finally {
      loading = false;
    }
  }

  function handleFilter(catId: number | null) {
    selectedCategory = catId;
    loadData();
  }

  function handleSearch(e: SubmitEvent) {
    e.preventDefault();
    loadData();
  }

  onMount(() => {
    loadData();
  });
</script>

<svelte:head>
  <title>Katalog Produk | E-Commerce Store</title>
</svelte:head>

<div class="catalog-page container">
  <!-- Search and Header -->
  <header class="catalog-header">
    <div>
      <h1>Katalog Produk</h1>
      <p>Jelajahi seluruh koleksi dan varian produk yang tersedia</p>
    </div>

    <form onsubmit={handleSearch} class="search-form">
      <input
        type="text"
        placeholder="Cari nama produk..."
        bind:value={searchQuery}
        class="search-input"
      />
      <button type="submit" class="btn btn-primary">Cari</button>
    </form>
  </header>

  <!-- Filter Category Badges -->
  <div class="category-filters">
    <button
      class="filter-chip {selectedCategory === null ? 'active' : ''}"
      onclick={() => handleFilter(null)}
      type="button"
    >
      Semua Kategori
    </button>
    {#each categories as cat}
      <button
        class="filter-chip {selectedCategory === cat.id ? 'active' : ''}"
        onclick={() => handleFilter(cat.id)}
        type="button"
      >
        {cat.name}
      </button>
    {/each}
  </div>

  <!-- Product List Grid -->
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Memuat katalog produk...</p>
    </div>
  {:else if errorMsg}
    <div class="error-box">{errorMsg}</div>
  {:else if products.length === 0}
    <div class="empty-state">
      <h3>Tidak ada produk yang sesuai</h3>
      <p>Coba gunakan kata kunci lain atau pilih kategori yang berbeda.</p>
    </div>
  {:else}
    <div class="products-grid">
      {#each products as product}
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
                {product.stock > 0 ? `Tersedia (${product.stock})` : 'Habis'}
              </span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 5rem;
  }

  .catalog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .catalog-header h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 0.25rem;
  }

  .catalog-header p {
    color: #64748b;
  }

  .search-form {
    display: flex;
    gap: 0.5rem;
    min-width: 320px;
  }

  .search-input {
    flex: 1;
    padding: 0.65rem 1rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    outline: none;
  }

  .search-input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }

  .category-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-bottom: 2.5rem;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 1rem;
  }

  .filter-chip {
    padding: 0.45rem 1rem;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 9999px;
    font-size: 0.9rem;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-chip:hover {
    background: #e2e8f0;
    color: #1e293b;
  }

  .filter-chip.active {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
    font-weight: 600;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.75rem;
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
  }

  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
  }

  .product-image {
    width: 100%;
    height: 200px;
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
    font-size: 3.5rem;
  }

  .product-info {
    padding: 1.25rem;
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
    margin-bottom: 0.35rem;
  }

  .product-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1rem;
  }

  .product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }

  .product-price {
    font-size: 1.2rem;
    font-weight: 700;
    color: #0f172a;
  }

  .stock-badge {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
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

  .loading-state,
  .empty-state {
    text-align: center;
    padding: 5rem 1rem;
    color: #64748b;
  }

  .empty-state h3 {
    font-size: 1.3rem;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .error-box {
    padding: 1.5rem;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
  }

  .btn {
    padding: 0.6rem 1.25rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-primary:hover {
    background: #1d4ed8;
  }
</style>

