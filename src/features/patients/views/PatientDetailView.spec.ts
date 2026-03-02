import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import ToastService from 'primevue/toastservice'
import PatientDetailView from './PatientDetailView.vue'
import { usePatientsStore } from '../stores/patients'
import * as patientsApi from '../api/patients'

vi.mock('../api/patients', () => ({
  fetchPatients: vi.fn(),
  persistProviderLinks: vi.fn(),
}))

vi.mock('@/features/providers/api/providers', () => ({
  fetchProviders: vi.fn(),
}))

const { fetchPatients } = await import('../api/patients')
const { fetchProviders } = await import('@/features/providers/api/providers')
import { createMockPatient, createMockProvider } from '@/shared/test-utils/factories'

const mockPatient = createMockPatient({
  id: 'pat-1',
  fullName: 'John Doe',
  programmeName: 'Prog',
  programmeType: 'Type',
  programmePhase: 'Phase',
  address: { street: '1 St', suburb: 'S', city: 'C', province: 'P', postalCode: '1234' },
  providerIds: ['prov-1'],
  clinicalSummary: [
    { id: 'cs1', providerName: 'Dr A', date: '2024-01-15', comment: 'Note 1' },
  ],
})

const mockProvider = createMockProvider({ id: 'prov-1', name: 'Clinic A' })

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/patients', component: { template: '<div />' } },
    { path: '/patients/:id', component: PatientDetailView },
  ],
})

const stubButton = { template: '<button @click="$emit(\'click\')">{{ label }}</button>', props: ['label'] }
const stubStateLoading = { template: '<div class="state-loading">Loading</div>' }
const stubStateError = { template: '<div class="state-error"><button @click="$emit(\'retry\')">Retry</button></div>' }
const stubStateEmpty = { template: '<div class="state-empty"><slot /></div>' }

function createLinkProviderModalStub(confirmIds: string[] = ['prov-2']) {
  return {
    name: 'LinkProviderModal',
    template:
      '<div v-if="open" class="link-modal"><button @click="$emit(\'close\')">Close</button><button @click="$emit(\'confirm\', confirmIds)">Confirm</button></div>',
    props: ['open', 'providers', 'linkedProviderIds', 'isSubmitting', 'errorMessage'],
    data: () => ({ confirmIds }),
  }
}

function mountView(
  route = '/patients/pat-1',
  linkModalConfirmIds: string[] = ['prov-2'],
  piniaInstance?: ReturnType<typeof createPinia>,
) {
  return mount(PatientDetailView, {
    global: {
      plugins: [piniaInstance ?? createPinia(), router, ToastService],
      stubs: {
        Button: stubButton,
        StateLoading: stubStateLoading,
        StateError: stubStateError,
        StateEmpty: stubStateEmpty,
        LinkProviderModal: createLinkProviderModalStub(linkModalConfirmIds),
      },
    },
  })
}

describe('PatientDetailView', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.mocked(fetchPatients).mockResolvedValue([mockPatient])
    vi.mocked(fetchProviders).mockResolvedValue([mockProvider])
    await router.push('/patients/pat-1')
  })

  it('shows loading state initially', async () => {
    vi.mocked(fetchPatients).mockImplementation(() => new Promise(() => {}))
    vi.mocked(fetchProviders).mockImplementation(() => new Promise(() => {}))
    const wrapper = mountView()
    await nextTick()
    expect(wrapper.find('.state-loading').exists()).toBe(true)
  })

  it('shows patient details when loaded', async () => {
    const wrapper = mountView()
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('pat-1')
  })

  it('shows error state and retries on Retry click', async () => {
    vi.mocked(fetchPatients).mockRejectedValue(new Error('API error'))
    vi.mocked(fetchProviders).mockResolvedValue([])
    const wrapper = mountView()
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.find('.state-error').exists()).toBe(true)
    vi.mocked(fetchPatients).mockResolvedValue([mockPatient])
    vi.mocked(fetchProviders).mockResolvedValue([])
    await wrapper.find('.state-error button').trigger('click')
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('John Doe')
  })

  it('shows empty state when patient not found', async () => {
    vi.mocked(fetchPatients).mockResolvedValue([])
    vi.mocked(fetchProviders).mockResolvedValue([])
    await router.push('/patients/unknown')
    const wrapper = mountView('/patients/unknown')
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('Patient was not found')
  })

  it('shows error and rolls back when persistProviderLinks fails', async () => {
    vi.mocked(patientsApi.persistProviderLinks).mockClear()
    vi.mocked(patientsApi.persistProviderLinks).mockRejectedValue(new Error('Network error'))
    const wrapper = mountView(undefined, ['prov-2'], pinia)
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    const linkBtn = wrapper.findAll('button').find((b) => b.text().includes('Link Provider'))
    expect(linkBtn).toBeDefined()
    await linkBtn!.trigger('click')
    await nextTick()
    await new Promise((r) => setTimeout(r, 100))
    const linkModal = wrapper.findComponent({ name: 'LinkProviderModal' })
    expect(linkModal.exists()).toBe(true)
    await linkModal.vm.$emit('confirm', ['prov-2'])
    await nextTick()
    await new Promise((r) => setTimeout(r, 100))
    expect(patientsApi.persistProviderLinks).toHaveBeenCalledWith('pat-1', ['prov-2'])
    const patientsStore = usePatientsStore()
    const patient = patientsStore.getById('pat-1')
    expect(patient?.providerIds).toEqual(['prov-1'])
  })

  it('shows generic error when persistProviderLinks rejects with non-Error', async () => {
    vi.mocked(patientsApi.persistProviderLinks).mockClear()
    vi.mocked(patientsApi.persistProviderLinks).mockRejectedValue('string error')
    const wrapper = mountView(undefined, ['prov-2'], pinia)
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    const linkBtn = wrapper.findAll('button').find((b) => b.text().includes('Link Provider'))
    expect(linkBtn).toBeDefined()
    await linkBtn!.trigger('click')
    await nextTick()
    await new Promise((r) => setTimeout(r, 100))
    const linkModal = wrapper.findComponent({ name: 'LinkProviderModal' })
    expect(linkModal.exists()).toBe(true)
    await linkModal.vm.$emit('confirm', ['prov-2'])
    await nextTick()
    await new Promise((r) => setTimeout(r, 100))
    expect(patientsApi.persistProviderLinks).toHaveBeenCalledWith('pat-1', ['prov-2'])
    const patientsStore = usePatientsStore()
    const patient = patientsStore.getById('pat-1')
    expect(patient?.providerIds).toEqual(['prov-1'])
  })

  it('navigates to /patients when Back clicked', async () => {
    vi.mocked(fetchPatients).mockResolvedValue([])
    vi.mocked(fetchProviders).mockResolvedValue([])
    await router.push('/patients/unknown')
    const wrapper = mountView('/patients/unknown')
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    const pushSpy = vi.spyOn(router, 'push')
    const backBtn = wrapper.findAll('button').find((b) => b.text().includes('Back to patients'))
    await backBtn?.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith(expect.objectContaining({ path: '/patients' }))
  })

  it('opens link modal and persists on confirm', async () => {
    vi.mocked(patientsApi.persistProviderLinks).mockResolvedValue(undefined)
    const wrapper = mountView()
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    const linkBtn = wrapper.findAll('button').find((b) => b.text().includes('Link Provider'))
    expect(linkBtn).toBeDefined()
    await linkBtn!.trigger('click')
    await nextTick()
    await new Promise((r) => setTimeout(r, 100))
    const linkModal = wrapper.findComponent({ name: 'LinkProviderModal' })
    expect(linkModal.exists()).toBe(true)
    await linkModal.vm.$emit('confirm', ['prov-2'])
    await nextTick()
    expect(patientsApi.persistProviderLinks).toHaveBeenCalledWith('pat-1', ['prov-2'])
  })

  it('closes modal when confirming with only already-linked providers', async () => {
    vi.mocked(patientsApi.persistProviderLinks).mockResolvedValue(undefined)
    vi.mocked(patientsApi.persistProviderLinks).mockClear()
    const wrapper = mountView('/patients/pat-1', ['prov-1'])
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    const linkBtn = wrapper.findAll('button').find((b) => b.text().includes('Link Provider'))
    expect(linkBtn).toBeDefined()
    await linkBtn!.trigger('click')
    await nextTick()
    await new Promise((r) => setTimeout(r, 100))
    const linkModal = wrapper.findComponent({ name: 'LinkProviderModal' })
    expect(linkModal.exists()).toBe(true)
    await linkModal.vm.$emit('confirm', ['prov-1'])
    await nextTick()
    expect(patientsApi.persistProviderLinks).not.toHaveBeenCalled()
  })

})
