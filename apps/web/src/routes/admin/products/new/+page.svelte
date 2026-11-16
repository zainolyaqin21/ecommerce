<script lang="ts">
  import { onMount } from "svelte";
  import { api, uploadImageFile, getImageUrl } from "$lib/api";
  import { goto } from "$app/navigation";

  let categories = $state<any[]>([]);
  let loadingCategories = $state(true);
  let submitting = $state(false);
  let errorMsg = $state("");

  // Master product fields
  let name = $state("");
  let slug = $state("");
  let categoryId = $state<number | null>(null);
  let description = $state("");
  let price = $state<number>(0);
  let stock = $state<number>(0);
  let imageUrl = $state("");
  let selectedFile = $state<File | null>(null);
  let imagePreview = $state<string>("");

  // Product variants
  interface VariantItem {
    sku: string;
    name: string;
    price: number;
    stock: number;
    color: string;
    size: string;
    imageUrl: string;
    selectedFile?: File | null;
    imagePreview?: string;
  }

  let variants = $state<VariantItem[]>([]);

  function handleNameChange(val: string) {
    name = val;
    slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleMasterFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      selectedFile = file;
      imagePreview = URL.createObjectURL(file);
    }
  }

  function handleVariantFileSelect(index: number, e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      variants[index].selectedFile = file;
      variants[index].imagePreview = URL.createObjectURL(file);
    }
  }

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
      selectedFile: null,
      imagePreview: "",
    });
  }

  function removeVariant(index: number) {
    variants = variants.filter((_, i) => i !== index);
  }

  async function loadCategories() {
    try {
      const res = await api.categories.get();
      if (res.data?.data) {
        categories = res.data.data;
        if (categories.length > 0) {
          categoryId = categories[0].id;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      loadingCategories = false;
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!name || !slug || !categoryId) {
      alert("Harap lengkapi semua kolom wajib");
      return;
    }

    submitting = true;
    errorMsg = "";

    try {
      let finalImageUrl = imageUrl;
      if (selectedFile) {
        finalImageUrl = await uploadImageFile(selectedFile);
      }

      const formattedVariants = await Promise.all(
        variants.map(async (v) => {
          let vImageUrl = v.imageUrl;
          if (v.selectedFile) {
            vImageUrl = await uploadImageFile(v.selectedFile);
          }

          return {
            sku: v.sku.trim(),
            name: v.name.trim(),
            price: Number(v.price),
            stock: Number(v.stock),
            attributes: (v.color || v.size) ? {
              ...(v.color ? { color: v.color } : {}),
              ...(v.size ? { size: v.size } : {}),
            } : undefined,
            imageUrl: vImageUrl || undefined,
          };
        })
      );

      const res = await api.products.post({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        categoryId: Number(categoryId),
        description: description || undefined,
        price: Number(price),
        stock: Number(stock),
        imageUrl: finalImageUrl || undefined,
        variants: formattedVariants.length > 0 ? formattedVariants : undefined,
      });

      if (res.error) {
        errorMsg = (res.error as any)?.value?.error || "Gagal membuat produk";
      } else {
        goto("/admin/products");
      }
    } catch (e: any) {
      errorMsg = e?.message || "Terjadi kesalahan saat menyimpan produk";
    } finally {
      submitting = false;
    }
  }

  onMount(() => {
    loadCategories();
  });
</script>

<svelte:head>
  <title>Tambah Produk Baru | Admin E-Commerce</title>
</svelte:head>

<div class="product-form-page">
  <div class="header-action">
    <a href="/admin/products" class="back-link">&larr; Kembali ke Daftar Produk</a>
    <h1>Tambah Produk Baru</h1>
  </div>

  {#if errorMsg}
    <div class="alert alert-error">⚠️ {errorMsg}</div>
  {/if}

  <form onsubmit={handleSubmit} class="form-container">
    <!-- Master Information -->
    <div class="card section-card">
      <h2>Informasi Dasar Produk</h2>

      <div class="form-grid">
        <div class="form-group col-span-2">
          <label for="name">Nama Produk *</label>
          <input
            id="name"
            type="text"
            value={name}
            oninput={(e) => handleNameChange((e.target as HTMLInputElement).value)}
            placeholder="Contoh: Kemeja Formal Pria"
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
            placeholder="kemeja-formal-pria"
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
          <label for="prod-file">Upload Foto Produk (File Gambar)</label>
          <input
            id="prod-file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onchange={handleMasterFileSelect}
            class="input-control file-input"
          />
          <p class="help-text">Format didukung: JPG, PNG, WEBP, GIF (Verifikasi Magic Bytes isi file, Maks 5MB)</p>
          {#if imagePreview}
            <div class="preview-box">
              <img src={imagePreview} alt="Preview Produk" class="product-preview-img" />
              <button
                type="button"
                class="btn-remove-img"
                onclick={() => { selectedFile = null; imagePreview = ''; imageUrl = ''; }}
              >
                ✕ Hapus Gambar
              </button>
            </div>
          {/if}
        </div>

        <div class="form-group col-span-2">
          <label for="desc">Deskripsi Produk</label>
          <textarea
            id="desc"
            bind:value={description}
            rows="4"
            class="input-control"
            placeholder="Jelaskan detail bahan, fitur, dan spesifikasi produk..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Variants Configuration -->
    <div class="card section-card">
      <div class="section-header">
        <div>
          <h2>Konfigurasi Varian Produk</h2>
          <p>Tambahkan varian dengan SKU, kombinasi warna/ukuran, harga, dan stok spesifik.</p>
        </div>
        <button type="button" class="btn btn-outline" onclick={addVariant}>
          ➕ Tambah Varian
        </button>
      </div>

      {#if variants.length === 0}
        <div class="empty-variant-box">
          <p>Belum ada varian ditambahkan. Produk ini hanya akan menggunakan harga & stok dasar.</p>
          <button type="button" class="btn btn-sm btn-outline" onclick={addVariant}>
            Buat Varian Pertama
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
                    placeholder="Contoh: Merah - L"
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
                  <label for={"color-" + idx}>Warna (Atribut)</label>
                  <input
                    id={"color-" + idx}
                    type="text"
                    bind:value={variant.color}
                    placeholder="Merah"
                    class="input-control"
                  />
                </div>

                <div class="form-group">
                  <label for={"size-" + idx}>Ukuran (Atribut)</label>
                  <input
                    id={"size-" + idx}
                    type="text"
                    bind:value={variant.size}
                    placeholder="XL"
                    class="input-control"
                  />
                </div>

                <div class="form-group col-span-2">
                  <label for={"vimg-" + idx}>Foto Varian (Opsional)</label>
                  <input
                    id={"vimg-" + idx}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onchange={(e) => handleVariantFileSelect(idx, e)}
                    class="input-control file-input"
                  />
                  {#if variant.imagePreview}
                    <div class="preview-box">
                      <img src={variant.imagePreview} alt="Preview Varian" class="product-preview-img" />
                      <button
                        type="button"
                        class="btn-remove-img"
                        onclick={() => { variant.selectedFile = null; variant.imagePreview = ''; variant.imageUrl = ''; }}
                      >
                        ✕ Hapus Gambar
                      </button>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Actions -->
    <div class="submit-bar">
      <a href="/admin/products" class="btn btn-outline">Batal</a>
      <button type="submit" class="btn btn-primary" disabled={submitting}>
        {submitting ? 'Menyimpan Produk...' : 'Simpan Produk & Varian'}
      </button>
    </div>
  </form>
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

  .file-input {
    padding: 0.4rem;
  }

  .help-text {
    font-size: 0.78rem;
    color: #64748b;
    margin-top: 0.25rem;
  }

  .preview-box {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #f8fafc;
    padding: 0.5rem;
    border-radius: 0.375rem;
  }

  .product-preview-img {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: 0.375rem;
    border: 1px solid #e2e8f0;
  }

  .btn-remove-img {
    background: #fee2e2;
    color: #b91c1c;
    border: none;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .btn-outline {
    background: white;
    border: 1px solid #cbd5e1;
    color: #475569;
  }
</style>

