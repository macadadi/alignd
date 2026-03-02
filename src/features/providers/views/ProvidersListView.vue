<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()
const providersStore = useProvidersStore()
const patientsStore = usePatientsStore()
const { searchQuery, debouncedSearch, setSearch } = useSearchInput(250)
const selectedProviderType = ref('')

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

function onRowClick(event: { data: ProviderRow }): void {
  router.push(`/providers/${event.data.id}`)
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
          <Badge>{{ data.patientCount }} patients</Badge>
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
</style>
