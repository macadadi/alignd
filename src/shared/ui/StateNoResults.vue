<script setup lang="ts">
defineSlots<{
  default?(): unknown
}>()
</script>

<template>
  <div class="state state-no-results" role="status">
    <slot>
      <p class="state-no-results__text">No results match your search.</p>
    </slot>
  </div>
</template>

<style scoped>
.state-no-results__text {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--color-text);
}
</style>
