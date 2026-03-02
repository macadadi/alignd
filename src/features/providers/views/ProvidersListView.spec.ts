import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import ProvidersListView from './ProvidersListView.vue'

vi.mock('../api/providers', () => ({
  fetchProviders: vi.fn(),
}))

vi.mock('@/features/patients/api/patients', () => ({
  fetchPatients: vi.fn(),
}))

const { fetchProviders } = await import('../api/providers')
const { fetchPatients } = await import('@/features/patients/api/patients')
import { createMockPatient, createMockProvider } from '@/shared/test-utils/factories'

const mockProvider = createMockProvider({ id: 'prov-1', name: 'Clinic Alpha' })
const mockPatient = createMockPatient({
  id: 'p1',
  fullName: 'Alice',
  programmeType: 'T',
  programmePhase: 'P1',
  providerIds: ['prov-1'],
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/providers', component: ProvidersListView },
    { path: '/providers/:id', component: { template: '<div />' } },
  ],
})

describe('ProvidersListView', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.mocked(fetchProviders).mockResolvedValue([mockProvider])
    vi.mocked(fetchPatients).mockResolvedValue([mockPatient])
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
    expect(dropdown.exists()).toBe(true)
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

  it('navigates to provider on row click', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(ProvidersListView, {
      global: { plugins: [createPinia(), router] },
    })
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    const row = wrapper.find('.p-datatable-tbody tr')
    if (row.exists()) await row.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/providers/prov-1')
  })
})
