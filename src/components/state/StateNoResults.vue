<script setup lang="ts">
defineSlots<{
  default?(): unknown
}>()
</script>

<template>
  <div class="state-no-results" role="status">
    <slot>
      <p class="state-no-results__text">No results match your search.</p>
    </slot>
  </div>
</template>

<style scoped>
.state-no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
}

.state-no-results__text {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--color-text);
}
</style>
