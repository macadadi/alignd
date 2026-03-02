<script setup lang="ts">
defineSlots<{
  default?(): unknown
}>()
</script>

<template>
  <div class="state state-empty" role="status">
    <slot>
      <p class="state-empty__text">No items yet.</p>
    </slot>
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  .state-empty :deep(.p-button) {
    min-height: 44px;
    min-width: 120px;
  }
}

.state-empty__text {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--color-text);
}
</style>
