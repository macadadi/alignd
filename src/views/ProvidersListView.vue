<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import StateLoading from '@/components/state/StateLoading.vue'
import StateError from '@/components/state/StateError.vue'
import StateEmpty from '@/components/state/StateEmpty.vue'
import StateNoResults from '@/components/state/StateNoResults.vue'
import { useDebounce } from '@/composables/useDebounce'
import { useProvidersStore } from '@/stores/providers'
import { usePatientsStore } from '@/stores/patients'
import { buildProviderPatientCountMap, filterProvidersBySearch, filterProvidersByType } from '@/utils/selectors'

const providersStore = useProvidersStore()
const patientsStore = usePatientsStore()
const searchQuery = ref('')

const debouncedSearch = useDebounce(() => searchQuery.value, 250)
const selectedProviderType = ref('')

function setSearch(value: string): void {
  searchQuery.value = value
}

const providerTypes = computed(() =>
  Array.from(new Set(providersStore.items.map((provider) => provider.type))).sort(),
)

const filteredProviders = computed(() => {
  const byType = filterProvidersByType(providersStore.items, selectedProviderType.value)
  return filterProvidersBySearch(byType, debouncedSearch.value)
})

const providerCounts = computed(() =>
  buildProviderPatientCountMap(providersStore.items, patientsStore.items),
)

interface ProviderRow {
  id: string
  name: string
  type: string
  patientCount: number
}

const providerRows = computed<ProviderRow[]>(() =>
  filteredProviders.value.map((provider) => ({
    id: provider.id,
    name: provider.name,
    type: provider.type,
    patientCount: providerCounts.value.get(provider.id) ?? 0,
  })),
)

const isEmpty = computed(
  () => providersStore.items.length === 0 && !providersStore.isLoading,
)

const isNoResults = computed(
  () => filteredProviders.value.length === 0 && providersStore.items.length > 0,
)

onMounted(async () => {
  await Promise.all([providersStore.load(), patientsStore.load()])
})
</script>

<template>
  <section class="view">
    <header class="view-header">
      <h2>Providers</h2>
      <div class="header-controls">
        <span class="control-group">
          <label for="provider-search">Search providers</label>
          <InputText
            id="provider-search"
            :model-value="searchQuery"
            placeholder="Search by provider name"
            @update:model-value="setSearch(String($event ?? ''))"
          />
        </span>
        <label class="select-wrapper">
          <span>Provider Type</span>
          <Dropdown
            v-model="selectedProviderType"
            :options="providerTypes"
            placeholder="All provider types"
            show-clear
          />
        </label>
      </div>
    </header>

    <StateLoading v-if="providersStore.isLoading || patientsStore.isLoading" />
    <StateError
      v-else-if="Boolean(providersStore.error) || Boolean(patientsStore.error)"
      @retry="() => { providersStore.load(true); patientsStore.load(true) }"
    />
    <StateEmpty v-else-if="isEmpty" />
    <StateNoResults v-else-if="isNoResults" />

    <DataTable
      v-else
      :value="providerRows"
      scrollable
      scroll-height="560px"
      responsive-layout="scroll"
      class="provider-table"
    >
      <Column field="name" header="Provider Name" />
      <Column field="type" header="Provider Type" />
      <Column field="patientCount" header="Patient Count">
        <template #body="{ data }">
          <span class="badge">{{ data.patientCount }} patients</span>
        </template>
      </Column>
    </DataTable>
  </section>
</template>

<style scoped>
.view {
  display: grid;
  gap: 1rem;
}

.view-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.header-controls {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(180px, 240px);
  gap: 0.75rem;
  width: min(100%, 700px);
}

.control-group,
.select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

h2 {
  margin: 0;
}

.provider-table {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow: hidden;
}

.badge {
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  width: max-content;
}

@media (max-width: 900px) {
  .view-header {
    align-items: stretch;
    flex-direction: column;
  }

  .header-controls {
    grid-template-columns: 1fr;
    width: 100%;
  }

}
</style>

