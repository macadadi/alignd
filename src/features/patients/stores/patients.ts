import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Patient } from '@/shared/types/domain'
import { fetchPatients } from '../api/patients'
import { createLoadable } from '@/shared/stores/createLoadable'

export const usePatientsStore = defineStore('patients', () => {
  const items = ref<Patient[]>([])
  const loadable = createLoadable()

  function hydrate(patients: Patient[]): void {
    items.value = patients
  }

  async function load(force = false): Promise<void> {
    await loadable.run(async () => {
      const patients = await fetchPatients()
      hydrate(patients)
    }, force)
  }

  function getById(id: string): Patient | undefined {
    return items.value.find((patient) => patient.id === id)
  }

  function linkProvidersOptimistic(patientId: string, providerIds: string[]) {
    const patientIndex = items.value.findIndex((patient) => patient.id === patientId)
    if (patientIndex < 0) {
      throw new Error('Patient not found')
    }

    const patient = items.value[patientIndex]
    if (!patient) {
      throw new Error('Patient not found')
    }
    const uniqueRequestedIds = Array.from(new Set(providerIds))
    const idsToAdd = uniqueRequestedIds.filter((providerId) => !patient.providerIds.includes(providerId))

    if (idsToAdd.length === 0) {
      return {
        addedIds: [] as string[],
        rollback: () => {
          // no-op rollback when there are no optimistic changes
        },
      }
    }

    const snapshot = [...patient.providerIds]
    patient.providerIds = [...patient.providerIds, ...idsToAdd]

    return {
      addedIds: idsToAdd,
      rollback: () => {
        const current = items.value.find((entry) => entry.id === patientId)
        if (!current) return
        current.providerIds = snapshot
      },
    }
  }

  return {
    items,
    isLoading: loadable.isLoading,
    error: loadable.error,
    hasLoaded: loadable.hasLoaded,
    load,
    getById,
    linkProvidersOptimistic,
  }
})
