<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import StateLoading from '@/components/state/StateLoading.vue'
import StateError from '@/components/state/StateError.vue'
import StateEmpty from '@/components/state/StateEmpty.vue'
import StateNoResults from '@/components/state/StateNoResults.vue'
import { useDebounce } from '@/composables/useDebounce'
import { usePatientsStore } from '@/stores/patients'
import { filterPatientsByProgramme, filterPatientsBySearch } from '@/utils/selectors'
import type { PatientAddress } from '@/types/domain'

const router = useRouter()
const patientsStore = usePatientsStore()
const searchQuery = ref('')

const debouncedSearch = useDebounce(() => searchQuery.value, 250)
const selectedProgrammeType = ref('')
const selectedProgrammePhase = ref('')

function setSearch(value: string): void {
  searchQuery.value = value
}

const programmeTypes = computed(() =>
  Array.from(new Set(patientsStore.items.map((patient) => patient.programmeType))).sort(),
)

const programmePhases = computed(() =>
  Array.from(new Set(patientsStore.items.map((patient) => patient.programmePhase))).sort(),
)

function formatAddress(address: PatientAddress): string {
  return [
    address.street,
    address.suburb,
    address.city,
    address.province,
    address.postalCode,
  ]
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

const isEmpty = computed(
  () => patientsStore.items.length === 0 && !patientsStore.isLoading,
)

const isNoResults = computed(
  () => filteredPatients.value.length === 0 && patientsStore.items.length > 0,
)

function navigateToPatient(patientId: string): void {
  router.push(`/patients/${patientId}`)
}

function onRowClick(event: { data: PatientRow }): void {
  navigateToPatient(event.data.id)
}

onMounted(async () => {
  await patientsStore.load()
})
</script>

<template>
  <section class="view">
    <header class="view-header">
      <h2>Patients</h2>
      <div class="header-controls">
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
      </div>
    </header>

    <StateLoading v-if="patientsStore.isLoading" />
    <StateError v-else-if="Boolean(patientsStore.error)" @retry="patientsStore.load(true)" />
    <StateEmpty v-else-if="isEmpty" />
    <StateNoResults v-else-if="isNoResults" />

    <DataTable
      v-else
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
          <RouterLink class="badge badge--link" :to="`/patients/${data.id}`" @click.stop>
            {{ data.providerCount }} linked providers
          </RouterLink>
        </template>
      </Column>
      <Column field="address" header="Address" />
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
  grid-template-columns: minmax(300px, 1fr) minmax(180px, 220px) minmax(180px, 220px);
  gap: 0.75rem;
  width: min(100%, 900px);
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

.patient-table {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow: hidden;
}

.patient-table :deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}

.badge {
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  width: max-content;
}

.badge--link {
  text-decoration: none;
  color: inherit;
}

.badge--link:hover {
  background: var(--color-background-soft);
}

@media (max-width: 1280px) {
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

