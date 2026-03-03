<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

defineOptions({ name: 'AppBadge' })

const props = withDefaults(
  defineProps<{
    /** When set, renders as RouterLink instead of span */
    to?: RouteLocationRaw
  }>(),
  { to: undefined },
)

const isLink = computed(() => Boolean(props.to))
</script>

<template>
  <RouterLink v-if="isLink" :to="to!" class="badge badge--link">
    <slot />
  </RouterLink>
  <span v-else class="badge">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  width: max-content;
  white-space: nowrap;
}

.badge--link {
  text-decoration: none;
  color: inherit;
}

.badge--link:hover {
  background: var(--color-background-soft);
}
</style>
