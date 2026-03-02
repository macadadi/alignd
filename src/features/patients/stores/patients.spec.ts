import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePatientsStore } from './patients'
import { createMockPatient } from '@/shared/test-utils/factories'

vi.mock('../api/patients', () => ({
  fetchPatients: vi.fn(),
  persistProviderLinks: vi.fn(),
}))

const { fetchPatients } = await import('../api/patients')

const mockPatient = (overrides = {}) =>
  createMockPatient({
    id: 'pat-1',
    programmeName: 'Prog',
    programmeType: 'Type',
    programmePhase: 'Phase',
    address: { street: '1 St', suburb: 'S', city: 'C', province: 'P', postalCode: '1234' },
    providerIds: ['prov-1'],
    ...overrides,
  })

describe('usePatientsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(fetchPatients).mockResolvedValue([mockPatient(), mockPatient({ id: 'pat-2' })])
  })

  it('loads patients and hydrates items', async () => {
    const store = usePatientsStore()
    await store.load()

    expect(store.items).toHaveLength(2)
    expect(store.hasLoaded).toBe(true)
    expect(store.error).toBeNull()
  })

  it('getById returns patient when found', async () => {
    const store = usePatientsStore()
    await store.load()

    expect(store.getById('pat-1')).toEqual(expect.objectContaining({ id: 'pat-1' }))
    expect(store.getById('pat-2')).toEqual(expect.objectContaining({ id: 'pat-2' }))
  })

  it('getById returns undefined when not found', async () => {
    const store = usePatientsStore()
    await store.load()

    expect(store.getById('unknown')).toBeUndefined()
  })

  it('sets error on load failure', async () => {
    vi.mocked(fetchPatients).mockRejectedValue(new Error('API error'))
    const store = usePatientsStore()
    await store.load()

    expect(store.error).toBe('API error')
    expect(store.items).toHaveLength(0)
  })

  it('linkProvidersOptimistic adds new provider ids', async () => {
    const store = usePatientsStore()
    await store.load()
    const patient = store.getById('pat-1')!
    expect(patient.providerIds).toContain('prov-1')

    const result = store.linkProvidersOptimistic('pat-1', ['prov-2', 'prov-3'])

    expect(result.addedIds).toEqual(['prov-2', 'prov-3'])
    expect(store.getById('pat-1')!.providerIds).toContain('prov-2')
    expect(store.getById('pat-1')!.providerIds).toContain('prov-3')
  })

  it('linkProvidersOptimistic returns no-op when all already linked', async () => {
    const store = usePatientsStore()
    await store.load()

    const result = store.linkProvidersOptimistic('pat-1', ['prov-1'])

    expect(result.addedIds).toEqual([])
    result.rollback() // no-op, should not throw
  })

  it('linkProvidersOptimistic rollback restores state', async () => {
    const store = usePatientsStore()
    await store.load()
    const snapshot = [...store.getById('pat-1')!.providerIds]

    const result = store.linkProvidersOptimistic('pat-1', ['prov-2'])
    expect(store.getById('pat-1')!.providerIds).toContain('prov-2')

    result.rollback()
    expect(store.getById('pat-1')!.providerIds).toEqual(snapshot)
  })

  it('linkProvidersOptimistic rollback is no-op when patient removed', async () => {
    const store = usePatientsStore()
    await store.load()
    const result = store.linkProvidersOptimistic('pat-1', ['prov-2'])
    const idx = store.items.findIndex((p) => p.id === 'pat-1')
    store.items.splice(idx, 1)
    result.rollback()
    expect(store.items).toHaveLength(1)
  })

  it('linkProvidersOptimistic throws when patient not found', async () => {
    const store = usePatientsStore()
    await store.load()

    expect(() => store.linkProvidersOptimistic('unknown', ['prov-1'])).toThrow('Patient not found')
  })

  it('load with force re-fetches', async () => {
    vi.mocked(fetchPatients).mockClear()
    const store = usePatientsStore()
    await store.load()
    await store.load(true)

    expect(fetchPatients).toHaveBeenCalledTimes(2)
  })
})
