<script lang="ts">
  import { authState } from "$lib/state/auth.svelte";
  import { goto } from "$app/navigation";

  let name = $state("");
  let email = $state("");
  let password = $state("");
  let errorMessage = $state<string | null>(null);
  let isSubmitting = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = null;

    if (!name || !email || !password) {
      errorMessage = "Semua kolom wajib diisi.";
      return;
    }

    if (password.length < 6) {
      errorMessage = "Password minimal 6 karakter.";
      return;
    }

    isSubmitting = true;
    const result = await authState.register({
      name,
      email,
      password,
    });
    isSubmitting = false;

    if (result.success) {
      goto("/login?registered=true");
    } else {
      errorMessage = result.error || "Pendaftaran gagal. Silakan coba lagi.";
    }
  }
</script>

<svelte:head>
  <title>Daftar Akun Baru | E-Commerce</title>
</svelte:head>

<div class="auth-page">
  <div class="auth-card">
    <div class="auth-header">
      <h2>Daftar Akun Baru</h2>
      <p>Buat akun customer untuk mulai berbelanja</p>
    </div>

    {#if errorMessage}
      <div class="alert alert-error">
        <span>⚠️</span>
        <span>{errorMessage}</span>
      </div>
    {/if}

    <form onsubmit={handleSubmit} class="auth-form">
      <div class="form-group">
        <label for="name">Nama Lengkap</label>
        <input
          id="name"
          type="text"
          bind:value={name}
          placeholder="Contoh: John Doe"
          required
          disabled={isSubmitting}
        />
      </div>

      <div class="form-group">
        <label for="email">Alamat Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="nama@email.com"
          required
          disabled={isSubmitting}
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="Minimal 6 karakter"
          required
          minlength="6"
          disabled={isSubmitting}
        />
      </div>

      <button type="submit" class="btn btn-submit" disabled={isSubmitting}>
        {isSubmitting ? "Mendaftarkan..." : "Daftar Sekarang"}
      </button>
    </form>

    <div class="auth-footer">
      Sudah punya akun? <a href="/login">Masuk di sini</a>
    </div>
  </div>
</div>

<style>
  .auth-page {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    background: #f8fafc;
  }

  .auth-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 2.5rem;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
  }

  .auth-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .auth-header h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
    color: #0f172a;
    font-weight: 700;
  }

  .auth-header p {
    margin: 0;
    color: #64748b;
    font-size: 0.95rem;
  }

  .alert {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }

  .alert-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #334155;
  }

  .form-group input {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 0.95rem;
    transition: all 0.15s ease;
    outline: none;
  }

  .form-group input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }

  .btn-submit {
    margin-top: 0.5rem;
    padding: 0.85rem;
    background: #2563eb;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .btn-submit:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .auth-footer {
    margin-top: 1.75rem;
    text-align: center;
    font-size: 0.9rem;
    color: #64748b;
  }

  .auth-footer a {
    color: #2563eb;
    font-weight: 600;
    text-decoration: none;
  }

  .auth-footer a:hover {
    text-decoration: underline;
  }
</style>
