<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { api } from "$lib/api";

  let product = $state<any>(null);
  let variants = $state<any[]>([]);
  let selectedVariant = $state<any>(null);
  let quantity = $state(1);
  let loading = $state(true);
  let errorMsg = $state("");
  let successMsg = $state("");

  async function loadProduct() {
    loading = true;
    errorMsg = "";
    try {
      const slug = page.params.slug;
      if (!slug) return;
      const res = await api.products.slug({ slug }).get();

      if (res.error || !res.data?.data) {
        errorMsg = "Produk tidak ditemukan.";
      } else {
        product = res.data.data;
        variants = product.variants || [];
        if (variants.length > 0) {
          selectedVariant = variants[0];
        }
      }
    } catch (e: any) {
      errorMsg = e?.message || "Gagal memuat detail produk";
    } finally {
      loading = false;
    }
  }

  function handleSelectVariant(variant: any) {
    selectedVariant = variant;
    quantity = 1;
    successMsg = "";
  }

  function handleAddToCart() {
    const currentStock = selectedVariant ? selectedVariant.stock : (product ? product.stock : 0);
    if (quantity > currentStock) {
      alert("Kuantitas melebihi stok yang tersedia");
      return;
    }

    successMsg = `Berhasil menambahkan ${quantity}x ${product.name} ${selectedVariant ? `(${selectedVariant.name})` : ''} ke keranjang!`;
  }

  onMount(() => {
    loadProduct();
  });
</script>

<svelte:head>
  <title>{product ? product.name : 'Detail Produk'} | E-Commerce Store</title>
</svelte:head>

<div class="product-detail-page container">
  <div class="breadcrumb">
    <a href="/">Beranda</a> &rarr;
    <a href="/products">Katalog</a> &rarr;
    <span>{product ? product.name : '...'}</span>
  </div>

  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Memuat detail produk...</p>
    </div>
  {:else if errorMsg}
    <div class="error-box">{errorMsg}</div>
  {:else if product}
    <div class="detail-grid">
      <!-- Product Image Gallery -->
      <div class="image-section">
        <div class="main-image">
          {#if (selectedVariant?.imageUrl || product.imageUrl)}
            <img src={selectedVariant?.imageUrl || product.imageUrl} alt={product.name} />
          {:else}
            <div class="image-placeholder">🛍️</div>
          {/if}
        </div>
      </div>

      <!-- Product Meta & Variant Selection -->
      <div class="info-section">
        {#if product.categoryName}
          <div class="category-tag">{product.categoryName}</div>
        {/if}
        <h1 class="product-name">{product.name}</h1>

        <div class="pricing-box">
          {#if selectedVariant}
            <div class="current-price">Rp {Number(selectedVariant.price).toLocaleString("id-ID")}</div>
            <div class="sku-tag">SKU: <strong>{selectedVariant.sku}</strong></div>
          {:else}
            <div class="current-price">Rp {Number(product.price).toLocaleString("id-ID")}</div>
          {/if}
        </div>

        {#if product.description}
          <div class="description-box">
            <h3>Deskripsi Produk</h3>
            <p>{product.description}</p>
          </div>
        {/if}

        <!-- Variants Selection -->
        {#if variants.length > 0}
          <div class="variant-selection">
            <h3>Pilih Varian:</h3>
            <div class="variant-chips">
              {#each variants as variant}
                <button
                  type="button"
                  class="variant-btn {selectedVariant?.id === variant.id ? 'active' : ''} {variant.stock <= 0 ? 'disabled' : ''}"
                  onclick={() => handleSelectVariant(variant)}
                  disabled={variant.stock <= 0}
                >
                  <span class="v-name">{variant.name}</span>
                  <span class="v-price">Rp {Number(variant.price).toLocaleString("id-ID")}</span>
                  {#if variant.stock <= 0}
                    <span class="v-out">Habis</span>
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Stock & Quantity -->
        <div class="stock-info">
          {#if selectedVariant}
            <div class="stock-status">
              Status: 
              <strong class="{selectedVariant.stock > 0 ? 'text-green' : 'text-red'}">
                {selectedVariant.stock > 0 ? `Tersedia (${selectedVariant.stock} item)` : 'Stok Habis'}
              </strong>
            </div>
          {:else}
            <div class="stock-status">
              Status: 
              <strong class="{product.stock > 0 ? 'text-green' : 'text-red'}">
                {product.stock > 0 ? `Tersedia (${product.stock} item)` : 'Stok Habis'}
              </strong>
            </div>
          {/if}
        </div>

        <!-- Add to Cart Form -->
        <div class="purchase-actions">
          <div class="quantity-input">
            <button
              type="button"
              onclick={() => quantity = Math.max(1, quantity - 1)}
              class="qty-btn"
              disabled={quantity <= 1}
            >-</button>
            <input type="number" bind:value={quantity} min="1" class="qty-field" />
            <button
              type="button"
              onclick={() => {
                const max = selectedVariant ? selectedVariant.stock : product.stock;
                if (quantity < max) quantity++;
              }}
              class="qty-btn"
            >+</button>
          </div>

          <button
            type="button"
            onclick={handleAddToCart}
            class="btn btn-primary btn-add-cart"
            disabled={(selectedVariant ? selectedVariant.stock : product.stock) <= 0}
          >
            🛒 Tambah ke Keranjang
          </button>
        </div>

        {#if successMsg}
          <div class="success-alert">
            ✅ {successMsg}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem 5rem;
  }

  .breadcrumb {
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 2rem;
    display: flex;
    gap: 0.5rem;
  }

  .breadcrumb a {
    color: #2563eb;
    text-decoration: none;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1.25fr;
    gap: 3.5rem;
  }

  @media (max-width: 768px) {
    .detail-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }

  .main-image {
    width: 100%;
    aspect-ratio: 1;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .main-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-placeholder {
    font-size: 5rem;
  }

  .category-tag {
    font-size: 0.85rem;
    text-transform: uppercase;
    color: #2563eb;
    font-weight: 700;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .product-name {
    font-size: 2.25rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
    margin-bottom: 1.25rem;
  }

  .pricing-box {
    display: flex;
    align-items: baseline;
    gap: 1.25rem;
    padding: 1.25rem;
    background: #f8fafc;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    margin-bottom: 2rem;
  }

  .current-price {
    font-size: 2rem;
    font-weight: 800;
    color: #0f172a;
  }

  .sku-tag {
    font-size: 0.9rem;
    color: #64748b;
  }

  .description-box {
    margin-bottom: 2rem;
  }

  .description-box h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .description-box p {
    color: #475569;
    line-height: 1.7;
  }

  .variant-selection {
    margin-bottom: 2rem;
  }

  .variant-selection h3 {
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: #1e293b;
  }

  .variant-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .variant-btn {
    padding: 0.75rem 1.25rem;
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 0.5rem;
    cursor: pointer;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    transition: all 0.2s;
  }

  .variant-btn:hover:not(:disabled) {
    border-color: #93c5fd;
  }

  .variant-btn.active {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .variant-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f1f5f9;
  }

  .v-name {
    font-weight: 700;
    color: #1e293b;
  }

  .v-price {
    font-size: 0.85rem;
    color: #64748b;
  }

  .v-out {
    font-size: 0.75rem;
    color: #dc2626;
    font-weight: 700;
  }

  .stock-info {
    margin-bottom: 2rem;
    font-size: 1rem;
    color: #334155;
  }

  .text-green {
    color: #16a34a;
  }

  .text-red {
    color: #dc2626;
  }

  .purchase-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .quantity-input {
    display: flex;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .qty-btn {
    width: 44px;
    height: 44px;
    background: #f8fafc;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .qty-btn:hover:not(:disabled) {
    background: #e2e8f0;
  }

  .qty-field {
    width: 60px;
    text-align: center;
    border: none;
    border-left: 1px solid #cbd5e1;
    border-right: 1px solid #cbd5e1;
    font-weight: 700;
    font-size: 1.05rem;
    outline: none;
  }

  .btn-add-cart {
    flex: 1;
    padding: 0 2rem;
    font-size: 1.05rem;
    font-weight: 700;
    border-radius: 0.5rem;
    border: none;
    background: #2563eb;
    color: white;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-add-cart:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .btn-add-cart:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }

  .success-alert {
    padding: 1rem 1.25rem;
    background: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
    border-radius: 0.5rem;
    font-weight: 600;
  }

  .error-box {
    padding: 1.5rem;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 0.5rem;
  }
</style>
