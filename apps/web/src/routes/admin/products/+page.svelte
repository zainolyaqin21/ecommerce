<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";

  let products = $state<any[]>([]);
  let loading = $state(true);
  let errorMsg = $state("");

  async function loadProducts() {
    loading = true;
    errorMsg = "";
    try {
      const res = await api.products.get();
      if (res.data?.data) {
        products = res.data.data;
      }
    } catch (e: any) {
      errorMsg = e?.message || "Gagal memuat daftar produk";
    } finally {
      loading = false;
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Yakin ingin menghapus produk "${name}"? Seluruh varian juga akan terhapus.`)) return;

    try {
      const res = await api.products.id({ id }).delete();
      if (res.error) {
        alert((res.error as any)?.value?.error || "Gagal menghapus produk");
      } else {
        await loadProducts();
      }
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan saat menghapus");
    }
  }

  onMount(() => {
    loadProducts();
  });
</script>

<svelte:head>
  <title>Kelola Produk | Admin E-Commerce</title>
</svelte:head>

<div class="products-admin-page">
  <header class="page-header">
    <div>
      <h1>Daftar Produk & Varian</h1>
      <p>Kelola katalog produk, harga dasar, stok, dan spesifikasi varian.</p>
    </div>

    <a href="/admin/products/new" class="btn btn-primary">
      ➕ Tambah Produk Baru
    </a>
  </header>

  {#if errorMsg}
    <div class="alert alert-error">{errorMsg}</div>
  {/if}

  <div class="table-card">
    {#if loading}
      <p class="loading-text">Memuat produk...</p>
    {:else if products.length === 0}
      <div class="empty-state">
        <h3>Belum ada produk</h3>
        <p>Mulai tambahkan produk pertama Anda beserta variannya.</p>
        <a href="/admin/products/new" class="btn btn-primary">Tambah Produk</a>
      </div>
    {:else}
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Gambar</th>
              <th>Nama Produk</th>
              <th>Kategori</th>
              <th>Harga Dasar</th>
              <th>Stok Master</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#each products as p}
              <tr>
                <td class="col-img">
                  {#if p.imageUrl}
                    <img src={p.imageUrl} alt={p.name} class="thumb-img" />
                  {:else}
                    <div class="thumb-placeholder">🛍️</div>
                  {/if}
                </td>
                <td>
                  <strong>{p.name}</strong>
                  <br />
                  <small class="text-muted"><code>/{p.slug}</code></small>
                </td>
                <td>{p.categoryName || '-'}</td>
                <td><strong>Rp {Number(p.price).toLocaleString("id-ID")}</strong></td>
                <td>
                  <span class="stock-badge {p.stock > 0 ? 'in-stock' : 'out-stock'}">
                    {p.stock}
                  </span>
                </td>
                <td class="text-right">
                  <a href="/admin/products/{p.id}" class="btn-sm btn-edit">
                    Edit & Varian
                  </a>
                  <button
                    type="button"
                    class="btn-sm btn-delete"
                    onclick={() => handleDelete(p.id, p.name)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<style>
  .products-admin-page {
    max-width: 1100px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .table-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .table-responsive {
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
  }

  .data-table th,
  .data-table td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
    text-align: left;
    vertical-align: middle;
  }

  .data-table th {
    background: #f8fafc;
    color: #64748b;
    font-weight: 600;
  }

  .col-img {
    width: 60px;
  }

  .thumb-img {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 0.375rem;
    border: 1px solid #e2e8f0;
  }

  .thumb-placeholder {
    width: 48px;
    height: 48px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }

  .text-muted {
    color: #64748b;
  }

  .text-right {
    text-align: right;
  }

  .stock-badge {
    padding: 0.2rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .stock-badge.in-stock {
    background: #dcfce7;
    color: #166534;
  }

  .stock-badge.out-stock {
    background: #fee2e2;
    color: #991b1b;
  }

  .btn {
    padding: 0.6rem 1.25rem;
    border-radius: 0.375rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    text-decoration: none;
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

  .btn-sm {
    padding: 0.35rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    text-decoration: none;
    display: inline-block;
    margin-left: 0.35rem;
  }

  .btn-edit {
    background: #e0f2fe;
    color: #0369a1;
  }

  .btn-edit:hover {
    background: #bae6fd;
  }

  .btn-delete {
    background: #fee2e2;
    color: #b91c1c;
  }

  .btn-delete:hover {
    background: #fecaca;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 1rem;
    color: #64748b;
  }

  .empty-state h3 {
    color: #1e293b;
    margin-bottom: 0.5rem;
  }
</style>
