<script setup lang="ts">
defineSlots<{
  default?(): unknown
}>()
</script>

<template>
  <div class="state-empty" role="status">
    <slot>
      <p class="state-empty__text">No items yet.</p>
    </slot>
  </div>
</template>

<style scoped>
.state-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
}

.state-empty__text {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--color-text);
}
</style>
