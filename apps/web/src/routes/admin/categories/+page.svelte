<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";

  let categories = $state<any[]>([]);
  let loading = $state(true);
  let errorMsg = $state("");
  let successMsg = $state("");

  // Form State
  let isEditing = $state(false);
  let editId = $state<number | null>(null);
  let name = $state("");
  let slug = $state("");
  let submitting = $state(false);

  async function loadCategories() {
    loading = true;
    errorMsg = "";
    try {
      const res = await api.categories.get();
      if (res.data?.data) {
        categories = res.data.data;
      }
    } catch (e: any) {
      errorMsg = e?.message || "Gagal memuat kategori";
    } finally {
      loading = false;
    }
  }

  function handleNameChange(val: string) {
    name = val;
    if (!isEditing) {
      slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
  }

  function startEdit(cat: any) {
    isEditing = true;
    editId = cat.id;
    name = cat.name;
    slug = cat.slug;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    isEditing = false;
    editId = null;
    name = "";
    slug = "";
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!name || !slug) return;

    submitting = true;
    errorMsg = "";
    successMsg = "";

    try {
      if (isEditing && editId) {
        const res = await api.categories({ id: editId }).put({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
        });
        if (res.error) {
          errorMsg = (res.error as any)?.value?.error || "Gagal memperbarui kategori";
        } else {
          successMsg = "Kategori berhasil diperbarui!";
          resetForm();
          await loadCategories();
        }
      } else {
        const res = await api.categories.post({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
        });
        if (res.error) {
          errorMsg = (res.error as any)?.value?.error || "Gagal menambahkan kategori";
        } else {
          successMsg = "Kategori berhasil ditambahkan!";
          resetForm();
          await loadCategories();
        }
      }
    } catch (e: any) {
      errorMsg = e?.message || "Terjadi kesalahan saat menyimpan kategori";
    } finally {
      submitting = false;
    }
  }

  async function handleDelete(id: number, catName: string) {
    if (!confirm(`Yakin ingin menghapus kategori "${catName}"?`)) return;

    try {
      const res = await api.categories({ id }).delete();
      if (res.error) {
        alert((res.error as any)?.value?.error || "Gagal menghapus kategori");
      } else {
        await loadCategories();
      }
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan saat menghapus");
    }
  }

  onMount(() => {
    loadCategories();
  });
</script>

<svelte:head>
  <title>Kelola Kategori | Admin E-Commerce</title>
</svelte:head>

<div class="categories-admin-page">
  <header class="page-header">
    <h1>Kelola Kategori Produk</h1>
    <p>Tambah, edit, dan hapus kategori produk pada toko Anda.</p>
  </header>

  {#if successMsg}
    <div class="alert alert-success">✅ {successMsg}</div>
  {/if}
  {#if errorMsg}
    <div class="alert alert-error">⚠️ {errorMsg}</div>
  {/if}

  <div class="admin-grid">
    <!-- Form Card -->
    <div class="form-card">
      <h2>{isEditing ? '✏️ Edit Kategori' : '➕ Tambah Kategori Baru'}</h2>
      <form onsubmit={handleSubmit} class="cat-form">
        <div class="form-group">
          <label for="name">Nama Kategori</label>
          <input
            id="name"
            type="text"
            value={name}
            oninput={(e) => handleNameChange((e.target as HTMLInputElement).value)}
            placeholder="Contoh: Pakaian Pria"
            required
            class="input-control"
          />
        </div>

        <div class="form-group">
          <label for="slug">Slug (URL)</label>
          <input
            id="slug"
            type="text"
            bind:value={slug}
            placeholder="contoh: pakaian-pria"
            required
            class="input-control"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" disabled={submitting}>
            {submitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Kategori')}
          </button>
          {#if isEditing}
            <button type="button" class="btn btn-outline" onclick={resetForm}>
              Batal
            </button>
          {/if}
        </div>
      </form>
    </div>

    <!-- Table Card -->
    <div class="table-card">
      <h2>Daftar Kategori ({categories.length})</h2>
      {#if loading}
        <p class="loading-text">Memuat kategori...</p>
      {:else if categories.length === 0}
        <p class="empty-text">Belum ada kategori.</p>
      {:else}
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Slug</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {#each categories as cat}
                <tr>
                  <td>#{cat.id}</td>
                  <td><strong>{cat.name}</strong></td>
                  <td><code>{cat.slug}</code></td>
                  <td class="text-right">
                    <button
                      type="button"
                      class="btn-sm btn-edit"
                      onclick={() => startEdit(cat)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      class="btn-sm btn-delete"
                      onclick={() => handleDelete(cat.id, cat.name)}
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
</div>

<style>
  .categories-admin-page {
    max-width: 1100px;
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

  .alert {
    padding: 0.85rem 1.25rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .alert-success {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
  }

  .alert-error {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
  }

  .admin-grid {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 2rem;
  }

  @media (max-width: 860px) {
    .admin-grid {
      grid-template-columns: 1fr;
    }
  }

  .form-card,
  .table-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .form-card h2,
  .table-card h2 {
    font-size: 1.2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.4rem;
  }

  .input-control {
    width: 100%;
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

  .form-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .table-responsive {
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f1f5f9;
    text-align: left;
  }

  .data-table th {
    background: #f8fafc;
    color: #64748b;
    font-weight: 600;
  }

  .text-right {
    text-align: right;
  }

  .btn {
    padding: 0.6rem 1.25rem;
    border-radius: 0.375rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
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

  .btn-sm {
    padding: 0.25rem 0.65rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    margin-left: 0.25rem;
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
</style>

