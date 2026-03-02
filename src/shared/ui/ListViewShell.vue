<script setup lang="ts">
import StateEmpty from './StateEmpty.vue'
import StateError from './StateError.vue'
import StateLoading from './StateLoading.vue'
import StateNoResults from './StateNoResults.vue'

defineProps<{
  title: string
  isLoading: boolean
  hasError: boolean
  isEmpty: boolean
  isNoResults: boolean
  /** CSS grid-template-columns for header controls, e.g. "minmax(300px, 1fr) minmax(180px, 220px)" */
  headerControlsGrid?: string
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <section class="list-view-shell">
    <header class="list-view-shell__header">
      <h2 class="list-view-shell__title">{{ title }}</h2>
      <div
        class="list-view-shell__controls"
        :style="headerControlsGrid ? { gridTemplateColumns: headerControlsGrid } : undefined"
      >
        <slot name="header-controls" />
      </div>
    </header>

    <StateLoading v-if="isLoading" />
    <StateError v-else-if="hasError" @retry="$emit('retry')" />
    <StateEmpty v-else-if="isEmpty" />
    <StateNoResults v-else-if="isNoResults" />

    <slot v-else />
  </section>
</template>

<style scoped>
.list-view-shell {
  display: grid;
  gap: 1rem;
}

.list-view-shell__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.list-view-shell__title {
  margin: 0;
}

.list-view-shell__controls {
  display: grid;
  gap: 0.75rem;
  width: min(100%, 900px);
}

@media (max-width: 960px) {
  .list-view-shell__header {
    align-items: stretch;
    flex-direction: column;
  }

  .list-view-shell__controls {
    grid-template-columns: 1fr !important;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .list-view-shell__header {
    gap: 0.75rem;
  }

  .list-view-shell__controls {
    gap: 0.5rem;
  }
}
</style>
