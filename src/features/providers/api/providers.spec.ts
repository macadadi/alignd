import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchProviders } from './providers'

vi.mock('@/services/api/client', () => ({
  apiClient: { get: vi.fn() },
  simulateLatency: vi.fn().mockResolvedValue(undefined),
}))

const { apiClient } = await import('@/services/api/client')

describe('providers API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchProviders returns mapped providers', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        providers: [{ id: '1', name: 'Clinic', type: 'GP' }],
      },
    })
    const result = await fetchProviders()
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ id: '1', name: 'Clinic', type: 'GP' })
  })
})
