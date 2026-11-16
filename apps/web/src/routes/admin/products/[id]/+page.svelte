<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { api } from "$lib/api";

  let productId = $state<number>(0);
  let categories = $state<any[]>([]);
  let loading = $state(true);
  let submitting = $state(false);
  let errorMsg = $state("");
  let successMsg = $state("");

  // Product fields
  let name = $state("");
  let slug = $state("");
  let categoryId = $state<number | null>(null);
  let description = $state("");
  let price = $state<number>(0);
  let stock = $state<number>(0);
  let imageUrl = $state("");

  // Variants
  interface VariantItem {
    id?: number;
    sku: string;
    name: string;
    price: number;
    stock: number;
    color: string;
    size: string;
    imageUrl: string;
  }

  let variants = $state<VariantItem[]>([]);

  function addVariant() {
    const nextIdx = variants.length + 1;
    variants.push({
      sku: `${slug ? slug.toUpperCase() : 'SKU'}-VAR-${nextIdx}`,
      name: `Varian #${nextIdx}`,
      price: price || 0,
      stock: 10,
      color: "",
      size: "",
      imageUrl: "",
    });
  }

  function removeVariant(index: number) {
    variants = variants.filter((_, i) => i !== index);
  }

  async function loadData() {
    loading = true;
    errorMsg = "";
    try {
      productId = Number(page.params.id);
      const [catRes, prodRes] = await Promise.all([
        api.categories.get(),
        api.products.id({ id: productId }).get(),
      ]);

      if (catRes.data?.data) {
        categories = catRes.data.data;
      }

      if (prodRes.error || !prodRes.data?.data) {
        errorMsg = "Produk tidak ditemukan";
      } else {
        const p = prodRes.data.data;
        name = p.name;
        slug = p.slug;
        categoryId = p.categoryId;
        description = p.description || "";
        price = p.price;
        stock = p.stock;
        imageUrl = p.imageUrl || "";

        variants = (p.variants || []).map((v: any) => ({
          id: v.id,
          sku: v.sku,
          name: v.name,
          price: v.price,
          stock: v.stock,
          color: v.attributes?.color || "",
          size: v.attributes?.size || "",
          imageUrl: v.imageUrl || "",
        }));
      }
    } catch (e: any) {
      errorMsg = e?.message || "Gagal memuat data produk";
    } finally {
      loading = false;
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    submitting = true;
    errorMsg = "";
    successMsg = "";

    try {
      const formattedVariants = variants.map((v) => ({
        id: v.id,
        sku: v.sku.trim(),
        name: v.name.trim(),
        price: Number(v.price),
        stock: Number(v.stock),
        attributes: (v.color || v.size) ? {
          ...(v.color ? { color: v.color } : {}),
          ...(v.size ? { size: v.size } : {}),
        } : undefined,
        imageUrl: v.imageUrl || undefined,
      }));

      const res = await api.products.id({ id: productId }).patch({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        categoryId: categoryId ? Number(categoryId) : undefined,
        description: description || undefined,
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl || undefined,
        variants: formattedVariants,
      });

      if (res.error) {
        errorMsg = (res.error as any)?.value?.error || "Gagal memperbarui produk";
      } else {
        successMsg = "Produk dan varian berhasil diperbarui!";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e: any) {
      errorMsg = e?.message || "Terjadi kesalahan saat menyimpan perubahan";
    } finally {
      submitting = false;
    }
  }

  onMount(() => {
    loadData();
  });
</script>

<svelte:head>
  <title>Edit Produk | Admin E-Commerce</title>
</svelte:head>

<div class="product-form-page">
  <div class="header-action">
    <a href="/admin/products" class="back-link">&larr; Kembali ke Daftar Produk</a>
    <h1>Edit Produk: {name || '...'}</h1>
  </div>

  {#if successMsg}
    <div class="alert alert-success">✅ {successMsg}</div>
  {/if}
  {#if errorMsg}
    <div class="alert alert-error">⚠️ {errorMsg}</div>
  {/if}

  {#if loading}
    <p>Memuat data produk...</p>
  {:else}
    <form onsubmit={handleSubmit} class="form-container">
      <div class="card section-card">
        <h2>Informasi Dasar Produk</h2>

        <div class="form-grid">
          <div class="form-group col-span-2">
            <label for="name">Nama Produk *</label>
            <input
              id="name"
              type="text"
              bind:value={name}
              required
              class="input-control"
            />
          </div>

          <div class="form-group">
            <label for="slug">Slug (URL) *</label>
            <input
              id="slug"
              type="text"
              bind:value={slug}
              required
              class="input-control"
            />
          </div>

          <div class="form-group">
            <label for="category">Kategori *</label>
            <select id="category" bind:value={categoryId} required class="input-control">
              {#each categories as cat}
                <option value={cat.id}>{cat.name}</option>
              {/each}
            </select>
          </div>

          <div class="form-group">
            <label for="price">Harga Dasar (Rp) *</label>
            <input
              id="price"
              type="number"
              bind:value={price}
              min="0"
              required
              class="input-control"
            />
          </div>

          <div class="form-group">
            <label for="stock">Stok Dasar *</label>
            <input
              id="stock"
              type="number"
              bind:value={stock}
              min="0"
              required
              class="input-control"
            />
          </div>

          <div class="form-group col-span-2">
            <label for="imageUrl">URL Gambar Produk</label>
            <input
              id="imageUrl"
              type="url"
              bind:value={imageUrl}
              class="input-control"
            />
          </div>

          <div class="form-group col-span-2">
            <label for="desc">Deskripsi Produk</label>
            <textarea
              id="desc"
              bind:value={description}
              rows="4"
              class="input-control"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Variants Configuration -->
      <div class="card section-card">
        <div class="section-header">
          <div>
            <h2>Kelola Varian Produk ({variants.length})</h2>
            <p>Atur varian SKU, harga, dan stok spesifik produk ini.</p>
          </div>
          <button type="button" class="btn btn-outline" onclick={addVariant}>
            ➕ Tambah Varian
          </button>
        </div>

        {#if variants.length === 0}
          <div class="empty-variant-box">
            <p>Belum ada varian pada produk ini.</p>
            <button type="button" class="btn btn-sm btn-outline" onclick={addVariant}>
              Tambah Varian
            </button>
          </div>
        {:else}
          <div class="variants-list">
            {#each variants as variant, idx}
              <div class="variant-item-box">
                <div class="variant-item-header">
                  <strong>Varian #{idx + 1}</strong>
                  <button
                    type="button"
                    class="btn-text-danger"
                    onclick={() => removeVariant(idx)}
                  >
                    ✕ Hapus Varian
                  </button>
                </div>

                <div class="variant-grid">
                  <div class="form-group">
                    <label for={"sku-" + idx}>SKU Varian *</label>
                    <input
                      id={"sku-" + idx}
                      type="text"
                      bind:value={variant.sku}
                      required
                      class="input-control"
                    />
                  </div>

                  <div class="form-group">
                    <label for={"name-" + idx}>Nama Varian *</label>
                    <input
                      id={"name-" + idx}
                      type="text"
                      bind:value={variant.name}
                      required
                      class="input-control"
                    />
                  </div>

                  <div class="form-group">
                    <label for={"price-" + idx}>Harga (Rp) *</label>
                    <input
                      id={"price-" + idx}
                      type="number"
                      bind:value={variant.price}
                      min="0"
                      required
                      class="input-control"
                    />
                  </div>

                  <div class="form-group">
                    <label for={"stock-" + idx}>Stok *</label>
                    <input
                      id={"stock-" + idx}
                      type="number"
                      bind:value={variant.stock}
                      min="0"
                      required
                      class="input-control"
                    />
                  </div>

                  <div class="form-group">
                    <label for={"color-" + idx}>Warna</label>
                    <input
                      id={"color-" + idx}
                      type="text"
                      bind:value={variant.color}
                      class="input-control"
                    />
                  </div>

                  <div class="form-group">
                    <label for={"size-" + idx}>Ukuran</label>
                    <input
                      id={"size-" + idx}
                      type="text"
                      bind:value={variant.size}
                      class="input-control"
                    />
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="submit-bar">
        <a href="/admin/products" class="btn btn-outline">Kembali</a>
        <button type="submit" class="btn btn-primary" disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .product-form-page {
    max-width: 900px;
    padding-bottom: 4rem;
  }

  .header-action {
    margin-bottom: 2rem;
  }

  .back-link {
    color: #2563eb;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    display: inline-block;
    margin-bottom: 0.5rem;
  }

  .header-action h1 {
    font-size: 1.85rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
  }

  .card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1.75rem;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .card h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1.25rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .section-header h2 {
    margin: 0;
  }

  .section-header p {
    color: #64748b;
    font-size: 0.9rem;
    margin: 0.25rem 0 0;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  .col-span-2 {
    grid-column: span 2;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.4rem;
  }

  .input-control {
    padding: 0.65rem 0.85rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.375rem;
    font-size: 0.95rem;
    outline: none;
    box-sizing: border-box;
  }

  .input-control:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }

  .empty-variant-box {
    padding: 2.5rem;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    border-radius: 0.5rem;
    text-align: center;
    color: #64748b;
  }

  .variants-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .variant-item-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1.25rem;
  }

  .variant-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .btn-text-danger {
    background: transparent;
    border: none;
    color: #dc2626;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .variant-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .submit-bar {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .alert {
    padding: 0.85rem 1.25rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }

  .alert-success {
    background: #dcfce7;
    color: #166534;
  }

  .alert-error {
    background: #fee2e2;
    color: #991b1b;
  }

  .btn {
    padding: 0.65rem 1.5rem;
    border-radius: 0.375rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    text-decoration: none;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .btn-outline {
    background: white;
    border: 1px solid #cbd5e1;
    color: #475569;
  }
</style>
