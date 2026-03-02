import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import PatientsListView from './PatientsListView.vue'

vi.mock('../api/patients', () => ({
  fetchPatients: vi.fn(),
}))

const { fetchPatients } = await import('../api/patients')
import { createMockPatient } from '@/shared/test-utils/factories'

const mockPatient = createMockPatient({
  id: 'p1',
  fullName: 'Alice Smith',
  programmeType: 'TypeA',
  programmePhase: 'Phase1',
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/patients', component: PatientsListView },
    { path: '/patients/:id', component: { template: '<div />' } },
  ],
})

describe('PatientsListView', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.mocked(fetchPatients).mockResolvedValue([mockPatient])
    await router.push('/patients')
  })

  it('shows loading state initially', async () => {
    vi.mocked(fetchPatients).mockImplementation(() => new Promise(() => {}))
    const wrapper = mount(PatientsListView, {
      global: { plugins: [createPinia(), router] },
    })
    await nextTick()
    expect(wrapper.find('.state-loading').exists()).toBe(true)
  })

  it('shows patient table when loaded', async () => {
    const wrapper = mount(PatientsListView, {
      global: { plugins: [createPinia(), router] },
    })
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Alice Smith')
    expect(wrapper.text()).toContain('Patients')
  })

  it('shows error state and retries', async () => {
    vi.mocked(fetchPatients).mockRejectedValue(new Error('API error'))
    const wrapper = mount(PatientsListView, {
      global: { plugins: [createPinia(), router] },
    })
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.find('.state-error').exists()).toBe(true)
    vi.mocked(fetchPatients).mockResolvedValue([mockPatient])
    await wrapper.find('.state-error button').trigger('click')
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Alice Smith')
  })

  it('filters by search', async () => {
    const wrapper = mount(PatientsListView, {
      global: { plugins: [createPinia(), router] },
    })
    await nextTick()
    await new Promise((r) => setTimeout(r, 300))
    const input = wrapper.find('#patient-search')
    await input.setValue('Alice')
    await nextTick()
    await new Promise((r) => setTimeout(r, 300))
    expect(wrapper.text()).toContain('Alice Smith')
  })

  it('filters by programme type', async () => {
    vi.mocked(fetchPatients).mockResolvedValue([
      mockPatient,
      { ...mockPatient, id: 'p2', programmeType: 'TypeB', programmePhase: 'Phase2' },
    ])
    const wrapper = mount(PatientsListView, {
      global: { plugins: [createPinia(), router] },
    })
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    const dropdowns = wrapper.findAllComponents({ name: 'Select' })
    const typeDropdown = dropdowns.find((d) => d.props('placeholder')?.includes('programme type'))
    expect(typeDropdown).toBeDefined()
    await typeDropdown!.vm.$emit('update:modelValue', 'TypeA')
    await nextTick()
    expect(wrapper.text()).toContain('Alice Smith')
  })

  it('navigates to patient on row click', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mount(PatientsListView, {
      global: { plugins: [createPinia(), router] },
    })
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    const row = wrapper.find('.p-datatable-tbody tr')
    if (row.exists()) await row.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/patients/p1')
  })
})
