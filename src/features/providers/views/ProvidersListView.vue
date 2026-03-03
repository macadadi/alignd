<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Badge from '@/shared/ui/Badge.vue'
import ListViewShell from '@/shared/ui/ListViewShell.vue'
import { useSearchInput } from '@/shared/composables/useSearchInput'
import { useProvidersStore } from '../stores/providers'
import { usePatientsStore } from '@/features/patients/stores/patients'
import { buildProviderPatientCountMap, filterProvidersBySearch, filterProvidersByType } from '@/shared/utils/filters'
import { pluralize } from '@/shared/utils/format'

const route = useRoute()
const router = useRouter()
const providersStore = useProvidersStore()
const patientsStore = usePatientsStore()

const querySearch = () => String(route.query.search ?? '')
const queryType = () => String(route.query.type ?? '')

const { searchQuery, debouncedSearch, setSearch } = useSearchInput(250, querySearch())
const selectedProviderType = ref(queryType())

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

function buildListQuery(): Record<string, string> {
  const q: Record<string, string> = {}
  if (searchQuery.value) q.search = searchQuery.value
  if (selectedProviderType.value) q.type = selectedProviderType.value
  return q
}

function syncFiltersToUrl(): void {
  const query = buildListQuery()
  router.replace({ path: '/providers', query: Object.keys(query).length > 0 ? query : undefined })
}

let searchSyncTimeout: ReturnType<typeof setTimeout> | null = null
function debouncedSyncSearch(): void {
  if (searchSyncTimeout) clearTimeout(searchSyncTimeout)
  searchSyncTimeout = setTimeout(() => {
    syncFiltersToUrl()
    searchSyncTimeout = null
  }, 300)
}

watch(searchQuery, debouncedSyncSearch)
watch(selectedProviderType, syncFiltersToUrl)

function onRowClick(event: { data: ProviderRow }): void {
  router.push({ path: `/providers/${event.data.id}`, state: { fromListQuery: buildListQuery() } })
}

onMounted(async () => {
  await Promise.all([providersStore.load(), patientsStore.load()])
})
</script>

<template>
  <ListViewShell
    title="Providers"
    :is-loading="providersStore.isLoading || patientsStore.isLoading"
    :has-error="Boolean(providersStore.error) || Boolean(patientsStore.error)"
    :is-empty="isEmpty"
    :is-no-results="isNoResults"
    header-controls-grid="minmax(320px, 1fr) minmax(180px, 240px)"
    @retry="() => { providersStore.load(true); patientsStore.load(true) }"
  >
    <template #header-controls>
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
        <Select
          v-model="selectedProviderType"
          :options="providerTypes"
          placeholder="All provider types"
          show-clear
        />
      </label>
    </template>

    <DataTable
      :value="providerRows"
      scrollable
      scroll-height="560px"
      responsive-layout="scroll"
      class="provider-table"
      @row-click="onRowClick"
    >
      <Column field="name" header="Provider Name" />
      <Column field="type" header="Provider Type" />
      <Column field="patientCount" header="Patient Count">
        <template #body="{ data }">
          <Badge>{{ pluralize(data.patientCount, 'patient', 'patients') }}</Badge>
        </template>
      </Column>
    </DataTable>
  </ListViewShell>
</template>

<style scoped>
.provider-table {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow: hidden;
}

.provider-table :deep(.p-datatable-tbody > tr:nth-child(even)) {
  background: var(--color-background-soft);
}

.provider-table :deep(.p-datatable-tbody > tr:nth-child(odd)) {
  background: var(--color-background);
}
</style>
