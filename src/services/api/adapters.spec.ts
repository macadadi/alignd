import { describe, it, expect } from 'vitest'
import { mapPatientDtoToDomain, mapProviderDtoToDomain } from './adapters'
import type { PatientDTO, ProviderDTO } from '@/types/dto'

describe('mapPatientDtoToDomain', () => {
  it('maps PatientDTO to Patient domain', () => {
    const dto: PatientDTO = {
      id: 'pat-1',
      fullName: 'Jane Doe',
      membershipNumber: 'M123',
      schemeAdministrator: 'Scheme X',
      dependencyCode: 'D2',
      program: { name: 'Prog', type: 'Type', phase: 'Phase' },
      address: {
        street: '10 Main St',
        suburb: 'Suburb',
        city: 'City',
        province: 'Province',
        postalCode: '5678',
      },
      providers: [{ id: 'prov-1' }],
      clinicalSummary: [
        { id: 'cs-1', providerName: 'Dr A', date: '2024-01-15', comment: 'Note' },
      ],
    }
    const result = mapPatientDtoToDomain(dto)
    expect(result.id).toBe('pat-1')
    expect(result.fullName).toBe('Jane Doe')
    expect(result.membershipNumber).toBe('M123')
    expect(result.programmeName).toBe('Prog')
    expect(result.programmeType).toBe('Type')
    expect(result.programmePhase).toBe('Phase')
    expect(result.address.street).toBe('10 Main St')
    expect(result.providerIds).toEqual(['prov-1'])
    expect(result.clinicalSummary).toHaveLength(1)
    expect(result.clinicalSummary[0]).toEqual({
      id: 'cs-1',
      providerName: 'Dr A',
      date: '2024-01-15',
      comment: 'Note',
    })
  })
})

describe('mapProviderDtoToDomain', () => {
  it('maps ProviderDTO to Provider domain', () => {
    const dto: ProviderDTO = {
      id: 'prov-1',
      name: 'Clinic Alpha',
      type: 'GP',
    }
    const result = mapProviderDtoToDomain(dto)
    expect(result).toEqual({
      id: 'prov-1',
      name: 'Clinic Alpha',
      type: 'GP',
    })
  })
})
