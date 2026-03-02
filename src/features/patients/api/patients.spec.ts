import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchPatients, persistProviderLinks } from './patients'

vi.mock('@/services/api/client', () => ({
  apiClient: { get: vi.fn() },
  simulateLatency: vi.fn().mockResolvedValue(undefined),
}))

const { apiClient } = await import('@/services/api/client')

describe('patients API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchPatients returns mapped patients', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        patients: [
          {
            id: '1',
            fullName: 'Jane',
            membershipNumber: 'M1',
            schemeAdministrator: 'S',
            dependencyCode: 'D',
            program: { name: 'P', type: 'T', phase: 'Ph' },
            address: { street: '1', suburb: 'S', city: 'C', province: 'P', postalCode: '1' },
            providers: [{ id: 'prov-1' }],
            clinicalSummary: [],
          },
        ],
      },
    })
    const result = await fetchPatients()
    expect(result).toHaveLength(1)
    expect(result[0]!.fullName).toBe('Jane')
    expect(result[0]!.providerIds).toEqual(['prov-1'])
  })

  it('persistProviderLinks resolves', async () => {
    await expect(persistProviderLinks('p1', ['prov-1'])).resolves.toBeUndefined()
  })
})
