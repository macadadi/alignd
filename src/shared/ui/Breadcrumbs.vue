<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { usePatientsStore } from '@/features/patients/stores/patients'
import { useProvidersStore } from '@/features/providers/stores/providers'

const route = useRoute()
const patientsStore = usePatientsStore()
const providersStore = useProvidersStore()

interface BreadcrumbItem {
  label: string
  to?: string
}

const items = computed<BreadcrumbItem[]>(() => {
  const name = route.name as string | undefined
  const id = route.params.id as string | undefined

  if (name === 'patients') {
    return [{ label: 'Patients' }]
  }
  if (name === 'patient-detail' && id) {
    const patient = patientsStore.getById(id)
    return [
      { label: 'Patients', to: '/patients' },
      { label: patient?.fullName ?? id },
    ]
  }
  if (name === 'providers') {
    return [{ label: 'Providers' }]
  }
  if (name === 'provider-detail' && id) {
    const provider = providersStore.getById(id)
    return [
      { label: 'Providers', to: '/providers' },
      { label: provider?.name ?? id },
    ]
  }
  return []
})
</script>

<template>
  <nav v-if="items.length > 0" class="breadcrumbs" aria-label="Breadcrumb">
    <ol class="breadcrumbs__list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="breadcrumbs__item"
      >
        <RouterLink
          v-if="item.to"
          :to="item.to"
          class="breadcrumbs__link"
        >
          {{ item.label }}
        </RouterLink>
        <span v-else class="breadcrumbs__current" aria-current="page">
          {{ item.label }}
        </span>
        <span
          v-if="index < items.length - 1"
          class="breadcrumbs__separator"
          aria-hidden="true"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumbs {
  margin-bottom: 0.75rem;
}

.breadcrumbs__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.breadcrumbs__item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.breadcrumbs__link {
  color: var(--color-text);
  opacity: 0.85;
}

.breadcrumbs__link:hover {
  opacity: 1;
}

.breadcrumbs__current {
  font-weight: 600;
  color: var(--color-text);
}

.breadcrumbs__separator {
  opacity: 0.5;
  user-select: none;
}
</style>
