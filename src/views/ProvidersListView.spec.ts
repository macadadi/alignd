import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import ProvidersListView from './ProvidersListView.vue'

vi.mock('@/services/api', () => ({
  fetchPatients: vi.fn(),
  fetchProviders: vi.fn(),
}))

const { fetchPatients, fetchProviders } = await import('@/services/api')

const mockProvider = { id: 'prov-1', name: 'Clinic Alpha', type: 'GP' }
const mockPatient = {
  id: 'p1',
  fullName: 'Alice',
  membershipNumber: 'M001',
  schemeAdministrator: 'S',
  dependencyCode: 'D',
  programmeName: 'P',
  programmeType: 'T',
  programmePhase: 'P1',
  address: { street: '1', suburb: 'S', city: 'C', province: 'P', postalCode: '1' },
  providerIds: ['prov-1'],
  clinicalSummary: [],
}

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/providers', component: ProvidersListView }],
})

describe('ProvidersListView', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.mocked(fetchPatients).mockResolvedValue([mockPatient])
    vi.mocked(fetchProviders).mockResolvedValue([mockProvider])
    await router.push('/providers')
  })

  it('shows loading state initially', async () => {
    vi.mocked(fetchProviders).mockImplementation(() => new Promise(() => {}))
    vi.mocked(fetchPatients).mockImplementation(() => new Promise(() => {}))
    const wrapper = mount(ProvidersListView, {
      global: { plugins: [createPinia(), router] },
    })
    await nextTick()
    expect(wrapper.find('.state-loading').exists()).toBe(true)
  })

  it('shows provider table when loaded', async () => {
    const wrapper = mount(ProvidersListView, {
      global: { plugins: [createPinia(), router] },
    })
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Clinic Alpha')
    expect(wrapper.text()).toContain('Providers')
  })

  it('shows error state and retries', async () => {
    vi.mocked(fetchProviders).mockRejectedValue(new Error('API error'))
    vi.mocked(fetchPatients).mockResolvedValue([])
    const wrapper = mount(ProvidersListView, {
      global: { plugins: [createPinia(), router] },
    })
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.find('.state-error').exists()).toBe(true)
  })

  it('filters by provider type', async () => {
    vi.mocked(fetchProviders).mockResolvedValue([
      mockProvider,
      { ...mockProvider, id: 'prov-2', name: 'Clinic Beta', type: 'Specialist' },
    ])
    vi.mocked(fetchPatients).mockResolvedValue([mockPatient])
    const wrapper = mount(ProvidersListView, {
      global: { plugins: [createPinia(), router] },
    })
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    const dropdown = wrapper.findComponent({ name: 'Select' })
    expect(dropdown.exists(), 'Select component should be found').toBe(true)
    await dropdown.vm.$emit('update:modelValue', 'GP')
    await nextTick()
    expect(wrapper.text()).toContain('Clinic Alpha')
  })

  it('filters by search', async () => {
    const wrapper = mount(ProvidersListView, {
      global: { plugins: [createPinia(), router] },
    })
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    const input = wrapper.find('#provider-search')
    await input.setValue('Alpha')
    await nextTick()
    await new Promise((r) => setTimeout(r, 300))
    expect(wrapper.text()).toContain('Clinic Alpha')
  })
})
