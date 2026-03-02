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
  <div class="state-error" role="alert">
    <slot>
      <p class="state-error__text">Something went wrong.</p>
      <Button label="Try again" severity="secondary" @click="$emit('retry')" />
    </slot>
  </div>
</template>

<style scoped>
.state-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 2rem;
}

.state-error__text {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--color-text);
}
</style>
