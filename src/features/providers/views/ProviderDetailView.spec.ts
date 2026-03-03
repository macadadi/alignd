import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import ProviderDetailView from './ProviderDetailView.vue'
import { createMockPatient, createMockProvider } from '@/shared/test-utils/factories'

vi.mock('../api/providers', () => ({
  fetchProviders: vi.fn(),
}))

vi.mock('@/features/patients/api/patients', () => ({
  fetchPatients: vi.fn(),
}))

const { fetchProviders } = await import('../api/providers')
const { fetchPatients } = await import('@/features/patients/api/patients')

const mockProvider = createMockProvider({
  id: 'prov-1',
  name: 'Dr. Clinic Alpha',
  type: 'Independent Nurse',
})

const mockPatient = createMockPatient({
  id: 'pat-1',
  fullName: 'Alice Smith',
  membershipNumber: 'M001',
  providerIds: ['prov-1'],
})

const stubButton = { template: '<button @click="$emit(\'click\')">{{ label }}</button>', props: ['label'] }
const stubStateLoading = { template: '<div class="state-loading">Loading</div>' }
const stubStateError = { template: '<div class="state-error"><button @click="$emit(\'retry\')">Retry</button></div>' }
const stubStateEmpty = { template: '<div class="state-empty"><slot /></div>' }

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/providers', component: { template: '<div />' } },
    { path: '/providers/:id', component: ProviderDetailView },
    { path: '/patients/:id', component: { template: '<div />' } },
  ],
})

function mountView() {
  return mount(ProviderDetailView, {
    global: {
      plugins: [createPinia(), router],
      stubs: {
        Button: stubButton,
        StateLoading: stubStateLoading,
        StateError: stubStateError,
        StateEmpty: stubStateEmpty,
      },
    },
  })
}

describe('ProviderDetailView', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.mocked(fetchProviders).mockResolvedValue([mockProvider])
    vi.mocked(fetchPatients).mockResolvedValue([mockPatient])
    await router.push('/providers/prov-1')
  })

  it('shows loading state initially', async () => {
    vi.mocked(fetchProviders).mockImplementation(() => new Promise(() => {}))
    vi.mocked(fetchPatients).mockImplementation(() => new Promise(() => {}))
    const wrapper = mountView()
    await nextTick()
    expect(wrapper.find('.state-loading').exists()).toBe(true)
  })

  it('shows provider details when loaded', async () => {
    const wrapper = mountView()
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Dr. Clinic Alpha')
    expect(wrapper.text()).toContain('prov-1')
    expect(wrapper.text()).toContain('Independent Nurse')
    expect(wrapper.text()).toContain('1 linked patient')
  })

  it('shows error state and retries on Retry click', async () => {
    vi.mocked(fetchProviders).mockRejectedValue(new Error('API error'))
    vi.mocked(fetchPatients).mockResolvedValue([])
    const wrapper = mountView()
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.find('.state-error').exists()).toBe(true)
    vi.mocked(fetchProviders).mockResolvedValue([mockProvider])
    vi.mocked(fetchPatients).mockResolvedValue([])
    await wrapper.find('.state-error button').trigger('click')
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Dr. Clinic Alpha')
  })

  it('shows empty state when provider not found', async () => {
    vi.mocked(fetchProviders).mockResolvedValue([])
    vi.mocked(fetchPatients).mockResolvedValue([])
    await router.push('/providers/unknown')
    const wrapper = mountView()
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Provider was not found')
  })

  it('navigates to /providers when Back clicked (not found)', async () => {
    vi.mocked(fetchProviders).mockResolvedValue([])
    vi.mocked(fetchPatients).mockResolvedValue([])
    await router.push('/providers/unknown')
    const wrapper = mountView()
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    const pushSpy = vi.spyOn(router, 'push')
    const backBtn = wrapper.findAll('button').find((b) => b.text().includes('Back to providers'))
    await backBtn?.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith(expect.objectContaining({ path: '/providers' }))
  })

  it('navigates to /providers when Back clicked (provider loaded)', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mountView()
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    const backBtn = wrapper.findAll('button').find((b) => b.text().includes('Back to providers'))
    await backBtn?.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith(expect.objectContaining({ path: '/providers' }))
  })

  it('shows linked patients and navigates to patient on click', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mountView()
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Alice Smith')
    expect(wrapper.text()).toContain('M001')
    const patientItem = wrapper.find('.linked-list__item--clickable')
    await patientItem.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/patients/pat-1')
  })

  it('shows empty linked patients message when no patients linked', async () => {
    vi.mocked(fetchPatients).mockResolvedValue([
      createMockPatient({ id: 'pat-2', fullName: 'Bob', providerIds: [] }),
    ])
    const wrapper = mountView()
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('No linked patients yet.')
  })
})
