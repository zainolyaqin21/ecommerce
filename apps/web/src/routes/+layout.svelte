<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import { authState } from "$lib/state/auth.svelte";
  import { onMount } from "svelte";

  let { children } = $props();

  onMount(() => {
    authState.checkSession();
  });
</script>

<div class="layout">
  <Navbar />
  <main class="main-content">
    {@render children()}
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: #f8fafc;
    color: #0f172a;
  }

  :global(*),
  :global(*::before),
  :global(*::after) {
    box-sizing: border-box;
  }

  .layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
