<script setup lang="ts">
import Button from 'primevue/button'

defineSlots<{
  default?(): unknown
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="state state-error" role="alert">
    <slot>
      <p class="state-error__text">Something went wrong.</p>
      <Button label="Try again" severity="secondary" @click="$emit('retry')" />
    </slot>
  </div>
</template>

<style scoped>
.state-error {
  gap: 1rem;
}

@media (max-width: 640px) {
  .state-error :deep(.p-button) {
    min-height: 44px;
    min-width: 120px;
  }
}

.state-error__text {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--color-text);
}
</style>
