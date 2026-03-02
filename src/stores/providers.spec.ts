import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProvidersStore } from './providers'
import type { Provider } from '@/types/domain'

vi.mock('@/services/api', () => ({
  fetchPatients: vi.fn(),
  fetchProviders: vi.fn(),
}))

const { fetchProviders } = await import('@/services/api')

const mockProvider = (overrides: Partial<Provider> = {}): Provider =>
  ({
    id: 'prov-1',
    name: 'Clinic Alpha',
    type: 'GP',
    ...overrides,
  }) as Provider

describe('useProvidersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(fetchProviders).mockResolvedValue([
      mockProvider(),
      mockProvider({ id: 'prov-2', name: 'Clinic Beta' }),
    ])
  })

  it('loads providers and hydrates items', async () => {
    const store = useProvidersStore()
    await store.load()

    expect(store.items).toHaveLength(2)
    expect(store.hasLoaded).toBe(true)
    expect(store.error).toBeNull()
  })

  it('sets error on load failure', async () => {
    vi.mocked(fetchProviders).mockRejectedValue(new Error('Network error'))
    const store = useProvidersStore()
    await store.load()

    expect(store.error).toBe('Network error')
    expect(store.items).toHaveLength(0)
  })

  it('load with force re-fetches', async () => {
    vi.mocked(fetchProviders).mockClear()
    const store = useProvidersStore()
    await store.load()
    await store.load(true)

    expect(fetchProviders).toHaveBeenCalledTimes(2)
  })
})
