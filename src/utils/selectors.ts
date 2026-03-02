import type { Patient, Provider } from '@/types/domain'

/** Filter patients by search term (name). */
export function filterPatientsBySearch(
  patients: readonly Patient[],
  search: string
): Patient[] {
  const q = search.trim().toLowerCase()
  if (!q) return [...patients]
  return patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(q) ||
      p.membershipNumber.toLowerCase().includes(q),
  )
}

export function filterPatientsByProgramme(
  patients: readonly Patient[],
  programmeType: string,
  programmePhase: string,
): Patient[] {
  return patients.filter((patient) => {
    const typeMatches = !programmeType || patient.programmeType === programmeType
    const phaseMatches = !programmePhase || patient.programmePhase === programmePhase
    return typeMatches && phaseMatches
  })
}

/** Filter providers by search term (name). */
export function filterProvidersBySearch(
  providers: readonly Provider[],
  search: string
): Provider[] {
  const q = search.trim().toLowerCase()
  if (!q) return [...providers]
  return providers.filter((p) => p.name.toLowerCase().includes(q))
}

export function filterProvidersByType(
  providers: readonly Provider[],
  providerType: string,
): Provider[] {
  if (!providerType) return [...providers]
  return providers.filter((provider) => provider.type === providerType)
}

export function buildProviderPatientCountMap(
  providers: readonly Provider[],
  patients: readonly Patient[],
): Map<string, number> {
  const counts = new Map<string, number>()

  for (const provider of providers) {
    counts.set(provider.id, 0)
  }

  for (const patient of patients) {
    for (const providerId of patient.providerIds) {
      counts.set(providerId, (counts.get(providerId) ?? 0) + 1)
    }
  }

  return counts
}
