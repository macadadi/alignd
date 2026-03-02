import { describe, it, expect } from 'vitest'
import {
  filterPatientsBySearch,
  filterPatientsByProgramme,
  filterProvidersBySearch,
  filterProvidersByType,
  buildProviderPatientCountMap,
} from './selectors'
import type { Patient, Provider } from '@/types/domain'

const mockPatient = (overrides: Partial<Patient> = {}): Patient =>
  ({
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
    ...overrides,
  }) as Patient

const mockProvider = (overrides: Partial<Provider> = {}): Provider =>
  ({
    id: 'p1',
    name: 'Provider Alpha',
    type: 'GP',
    ...overrides,
  }) as Provider

describe('filterPatientsBySearch', () => {
  it('returns all patients when search is empty', () => {
    const patients = [mockPatient(), mockPatient({ id: '2' })]
    expect(filterPatientsBySearch(patients, '')).toEqual(patients)
    expect(filterPatientsBySearch(patients, '   ')).toEqual(patients)
  })

  it('filters by full name (case-insensitive)', () => {
    const patients = [
      mockPatient({ fullName: 'Alice Smith' }),
      mockPatient({ id: '2', fullName: 'Bob Jones' }),
    ]
    expect(filterPatientsBySearch(patients, 'alice')).toEqual([patients[0]])
    expect(filterPatientsBySearch(patients, 'ALICE')).toEqual([patients[0]])
  })

  it('filters by membership number', () => {
    const patients = [
      mockPatient({ membershipNumber: 'M001' }),
      mockPatient({ id: '2', membershipNumber: 'M002' }),
    ]
    expect(filterPatientsBySearch(patients, 'M001')).toEqual([patients[0]])
  })

  it('returns empty array when no match', () => {
    const patients = [mockPatient({ fullName: 'Alice' })]
    expect(filterPatientsBySearch(patients, 'xyz')).toEqual([])
  })
})

describe('filterPatientsByProgramme', () => {
  it('returns all when filters are empty', () => {
    const patients = [
      mockPatient({ programmeType: 'A', programmePhase: '1' }),
      mockPatient({ id: '2', programmeType: 'B', programmePhase: '2' }),
    ]
    expect(filterPatientsByProgramme(patients, '', '')).toEqual(patients)
  })

  it('filters by programme type', () => {
    const patients = [
      mockPatient({ programmeType: 'A' }),
      mockPatient({ id: '2', programmeType: 'B' }),
    ]
    expect(filterPatientsByProgramme(patients, 'A', '')).toEqual([patients[0]])
  })

  it('filters by programme phase', () => {
    const patients = [
      mockPatient({ programmePhase: 'Phase1' }),
      mockPatient({ id: '2', programmePhase: 'Phase2' }),
    ]
    expect(filterPatientsByProgramme(patients, '', 'Phase1')).toEqual([patients[0]])
  })

  it('filters by both type and phase', () => {
    const patients = [
      mockPatient({ programmeType: 'A', programmePhase: '1' }),
      mockPatient({ id: '2', programmeType: 'A', programmePhase: '2' }),
      mockPatient({ id: '3', programmeType: 'B', programmePhase: '1' }),
    ]
    expect(filterPatientsByProgramme(patients, 'A', '1')).toEqual([patients[0]])
  })
})

describe('filterProvidersBySearch', () => {
  it('returns all providers when search is empty', () => {
    const providers = [mockProvider(), mockProvider({ id: '2' })]
    expect(filterProvidersBySearch(providers, '')).toEqual(providers)
    expect(filterProvidersBySearch(providers, '   ')).toEqual(providers)
  })

  it('filters by name (case-insensitive)', () => {
    const providers = [
      mockProvider({ name: 'Alpha Clinic' }),
      mockProvider({ id: '2', name: 'Beta Hospital' }),
    ]
    expect(filterProvidersBySearch(providers, 'alpha')).toEqual([providers[0]])
  })

  it('returns empty when no match', () => {
    const providers = [mockProvider({ name: 'Alpha' })]
    expect(filterProvidersBySearch(providers, 'xyz')).toEqual([])
  })
})

describe('filterProvidersByType', () => {
  it('returns all when type is empty', () => {
    const providers = [mockProvider(), mockProvider({ id: '2', type: 'Specialist' })]
    expect(filterProvidersByType(providers, '')).toEqual(providers)
  })

  it('filters by type', () => {
    const providers = [
      mockProvider({ type: 'GP' }),
      mockProvider({ id: '2', type: 'Specialist' }),
    ]
    expect(filterProvidersByType(providers, 'GP')).toEqual([providers[0]])
  })
})

describe('buildProviderPatientCountMap', () => {
  it('returns zeros for providers with no patients', () => {
    const providers = [mockProvider({ id: 'p1' })]
    const patients: Patient[] = []
    const map = buildProviderPatientCountMap(providers, patients)
    expect(map.get('p1')).toBe(0)
  })

  it('counts linked patients per provider', () => {
    const providers = [
      mockProvider({ id: 'p1' }),
      mockProvider({ id: 'p2' }),
    ]
    const patients = [
      mockPatient({ id: '1', providerIds: ['p1'] }),
      mockPatient({ id: '2', providerIds: ['p1', 'p2'] }),
    ]
    const map = buildProviderPatientCountMap(providers, patients)
    expect(map.get('p1')).toBe(2)
    expect(map.get('p2')).toBe(1)
  })

  it('handles patient linked to provider not in providers list', () => {
    const providers = [mockProvider({ id: 'p1' })]
    const patients = [
      mockPatient({ id: '1', providerIds: ['p1', 'p-orphan'] }),
    ]
    const map = buildProviderPatientCountMap(providers, patients)
    expect(map.get('p1')).toBe(1)
    expect(map.get('p-orphan')).toBe(1)
  })
})
