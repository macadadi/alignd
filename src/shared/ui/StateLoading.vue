<script setup lang="ts">
defineSlots<{
  default?(): unknown
}>()
</script>

<template>
  <div class="state state-loading" role="status" aria-live="polite" aria-label="Loading">
    <slot>
      <span class="state-loading__spinner" aria-hidden="true" />
      <p class="state-loading__text">Loading…</p>
    </slot>
  </div>
</template>

<style scoped>
.state-loading {
  gap: 1rem;
}

.state-loading__spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--color-border);
  border-top-color: hsla(160, 100%, 37%, 1);
  border-radius: 50%;
  animation: state-loading-spin 0.8s linear infinite;
}

@keyframes state-loading-spin {
  to {
    transform: rotate(360deg);
  }
}

.state-loading__text {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--color-text);
}
</style>
