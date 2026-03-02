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
import { usePatientsStore } from '../stores/patients'
import { filterPatientsByProgramme, filterPatientsBySearch } from '@/shared/utils/filters'
import type { PatientAddress } from '@/shared/types/domain'

const route = useRoute()
const router = useRouter()
const patientsStore = usePatientsStore()

const querySearch = () => String(route.query.search ?? '')
const queryProgrammeType = () => String(route.query.programmeType ?? '')
const queryProgrammePhase = () => String(route.query.programmePhase ?? '')

const { searchQuery, debouncedSearch, setSearch } = useSearchInput(250, querySearch())
const selectedProgrammeType = ref(queryProgrammeType())
const selectedProgrammePhase = ref(queryProgrammePhase())

const programmeTypes = computed(() =>
  Array.from(new Set(patientsStore.items.map((patient) => patient.programmeType))).sort(),
)

const programmePhases = computed(() =>
  Array.from(new Set(patientsStore.items.map((patient) => patient.programmePhase))).sort(),
)

function formatAddress(address: PatientAddress): string {
  return [address.street, address.suburb, address.city, address.province, address.postalCode]
    .filter(Boolean)
    .join(', ')
}

interface PatientRow {
  id: string
  fullName: string
  membershipNumber: string
  schemeAdministrator: string
  dependencyCode: string
  programme: string
  programmePhase: string
  providerCount: number
  address: string
}

const filteredPatients = computed<PatientRow[]>(() => {
  const byProgramme = filterPatientsByProgramme(
    patientsStore.items,
    selectedProgrammeType.value,
    selectedProgrammePhase.value,
  )

  return filterPatientsBySearch(byProgramme, debouncedSearch.value).map((patient) => ({
    id: patient.id,
    fullName: patient.fullName,
    membershipNumber: patient.membershipNumber,
    schemeAdministrator: patient.schemeAdministrator,
    dependencyCode: patient.dependencyCode,
    programme: `${patient.programmeName} - ${patient.programmeType}`,
    programmePhase: patient.programmePhase,
    providerCount: patient.providerIds.length,
    address: formatAddress(patient.address),
  }))
})

const isEmpty = computed(() => patientsStore.items.length === 0 && !patientsStore.isLoading)

const isNoResults = computed(
  () => filteredPatients.value.length === 0 && patientsStore.items.length > 0,
)

function buildListQuery() {
  const q: Record<string, string> = {}
  if (searchQuery.value) q.search = searchQuery.value
  if (selectedProgrammeType.value) q.programmeType = selectedProgrammeType.value
  if (selectedProgrammePhase.value) q.programmePhase = selectedProgrammePhase.value
  return q
}

function syncFiltersToUrl(): void {
  const query = buildListQuery()
  router.replace({ path: '/patients', query: Object.keys(query).length > 0 ? query : undefined })
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
watch(selectedProgrammeType, syncFiltersToUrl)
watch(selectedProgrammePhase, syncFiltersToUrl)

function navigateToPatient(patientId: string): void {
  router.push({ path: `/patients/${patientId}`, state: { fromListQuery: buildListQuery() } })
}

function patientDetailTo(patientId: string) {
  return { path: `/patients/${patientId}`, state: { fromListQuery: buildListQuery() } }
}

function onRowClick(event: { data: PatientRow }): void {
  navigateToPatient(event.data.id)
}

onMounted(async () => {
  await patientsStore.load()
})
</script>

<template>
  <ListViewShell
    title="Patients"
    :is-loading="patientsStore.isLoading"
    :has-error="Boolean(patientsStore.error)"
    :is-empty="isEmpty"
    :is-no-results="isNoResults"
    header-controls-grid="minmax(300px, 1fr) minmax(180px, 220px) minmax(180px, 220px)"
    @retry="patientsStore.load(true)"
  >
    <template #header-controls>
      <span class="control-group">
        <label for="patient-search">Search patients</label>
        <InputText
          id="patient-search"
          :model-value="searchQuery"
          placeholder="Search by patient name or membership number"
          @update:model-value="setSearch(String($event ?? ''))"
        />
      </span>
      <label class="select-wrapper">
        <span>Programme Type</span>
        <Select
          v-model="selectedProgrammeType"
          :options="programmeTypes"
          placeholder="All programme types"
          show-clear
        />
      </label>
      <label class="select-wrapper">
        <span>Programme Phase</span>
        <Select
          v-model="selectedProgrammePhase"
          :options="programmePhases"
          placeholder="All programme phases"
          show-clear
        />
      </label>
    </template>

    <DataTable
      :value="filteredPatients"
      scrollable
      scroll-height="560px"
      responsive-layout="scroll"
      class="patient-table"
      @row-click="onRowClick"
    >
      <Column field="fullName" header="Full Name" />
      <Column field="membershipNumber" header="Membership Number" />
      <Column field="schemeAdministrator" header="Scheme Administrator" />
      <Column field="dependencyCode" header="Dependency Code" />
      <Column field="programme" header="Programme Name & Type" />
      <Column field="programmePhase" header="Programme Phase" />
      <Column field="providerCount" header="Provider Count">
        <template #body="{ data }">
          <Badge :to="patientDetailTo(data.id)" @click.stop>
            {{ data.providerCount }} linked providers
          </Badge>
        </template>
      </Column>
      <Column field="address" header="Address" />
    </DataTable>
  </ListViewShell>
</template>

<style scoped>
.patient-table {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow: hidden;
}

.patient-table :deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}

@media (max-width: 640px) {
  .patient-table :deep(.p-datatable-tbody > tr) {
    min-height: 44px;
  }
}
</style>
