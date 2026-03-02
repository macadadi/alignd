import { describe, it, expect } from 'vitest'
import { mapProviderDtoToDomain } from './adapters'
import type { ProviderDTO } from '@/shared/types/dto'

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
