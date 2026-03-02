import type { Patient, Provider } from '@/shared/types/domain'

const defaultPatient: Patient = {
  id: '1',
  fullName: 'John Doe',
  membershipNumber: 'M001',
  schemeAdministrator: 'Scheme A',
  dependencyCode: 'D1',
  programmeName: 'Programme X',
  programmeType: 'Type A',
  programmePhase: 'Phase 1',
  address: { street: '1 St', suburb: 'Sub', city: 'City', province: 'Prov', postalCode: '1234' },
  providerIds: ['p1'],
  clinicalSummary: [],
}

const defaultProvider: Provider = {
  id: 'p1',
  name: 'Provider Alpha',
  type: 'GP',
}

/** Factory for creating mock Patient objects in tests. */
export function createMockPatient(overrides: Partial<Patient> = {}): Patient {
  return { ...defaultPatient, ...overrides } as Patient
}

/** Factory for creating mock Provider objects in tests. */
export function createMockProvider(overrides: Partial<Provider> = {}): Provider {
  return { ...defaultProvider, ...overrides } as Provider
}
