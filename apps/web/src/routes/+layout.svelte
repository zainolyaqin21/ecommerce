<script lang="ts">
  let { children } = $props();
</script>

<div class="layout">
  {@render children()}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: #0f172a;
    color: #f8fafc;
  }

  .layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>

