import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import LinkProviderModal from './LinkProviderModal.vue'
import type { Provider } from '@/shared/types/domain'

const mockProviders: Provider[] = [
  { id: 'p1', name: 'Provider A', type: 'GP' },
  { id: 'p2', name: 'Provider B', type: 'Specialist' },
]

async function waitForModal(): Promise<HTMLElement> {
  for (let i = 0; i < 20; i++) {
    await nextTick()
    const input = document.getElementById('link-provider-search')
    if (input) return input
    await new Promise((r) => setTimeout(r, 50))
  }
  throw new Error('Modal input #link-provider-search not found after 20 attempts')
}

interface ModalProps {
  open?: boolean
  providers?: Provider[]
  linkedProviderIds?: string[]
  isSubmitting?: boolean
  errorMessage?: string
}

function mountModal(props: ModalProps = {}) {
  return mount(LinkProviderModal, {
    props: {
      open: true,
      providers: mockProviders,
      linkedProviderIds: [],
      isSubmitting: false,
      errorMessage: '',
      ...props,
    },
    attachTo: document.body,
  })
}

describe('LinkProviderModal', () => {
  let wrapper: ReturnType<typeof mountModal>

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renders when open', async () => {
    wrapper = mountModal()
    const input = await waitForModal()
    expect(input).toBeTruthy()
    expect(document.body.textContent).toContain('Link providers')
  })

  it('does not render when closed', () => {
    wrapper = mountModal({ open: false })
    expect(document.getElementById('link-provider-search')).toBeNull()
  })

  it('emits close when Dialog update:visible is false', async () => {
    wrapper = mountModal()
    await waitForModal()
    const dialog = wrapper.findComponent({ name: 'Dialog' })
    expect(dialog.exists()).toBe(true)
    await dialog.vm.$emit('update:visible', false)
    await nextTick()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close when Cancel clicked', async () => {
    wrapper = mountModal()
    await waitForModal()
    const cancelBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Cancel')
    cancelBtn?.click()
    await nextTick()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('shows error message when provided', async () => {
    wrapper = mountModal({ errorMessage: 'API failed' })
    await waitForModal()
    const el = document.querySelector('[role="alert"]')
    expect(el).toBeTruthy()
    expect(el!.textContent).toContain('API failed')
  })

  it('updates search when typing', async () => {
    wrapper = mountModal()
    const input = (await waitForModal()) as HTMLInputElement
    input.value = 'test'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    expect(input.value).toBe('test')
  })

  it('emits confirm with selected ids when checkbox toggled and Link clicked', async () => {
    wrapper = mountModal()
    await waitForModal()
    const checkboxes = document.querySelectorAll('.p-checkbox, input[type="checkbox"]')
    const clickable = Array.from(checkboxes).find((el) => {
      const input = el instanceof HTMLInputElement ? el : el.querySelector('input')
      return input && !input.disabled
    })
    if (clickable) {
      const target = clickable instanceof HTMLInputElement ? clickable : clickable.querySelector('input') ?? clickable
      target.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await nextTick()
    }
    const submitBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('Link selected'))
    submitBtn?.click()
    await nextTick()
    expect(wrapper.emitted('confirm')).toBeDefined()
  })

  it('shows Linking... when isSubmitting', async () => {
    wrapper = mountModal({ isSubmitting: true })
    await waitForModal()
    expect(document.body.textContent).toContain('Linking...')
  })

  it('does not toggle when provider is disabled (already linked)', async () => {
    wrapper = mountModal({ linkedProviderIds: ['p1'] })
    await waitForModal()
    const disabledCheckbox = Array.from(document.querySelectorAll('input[type="checkbox"]')).find(
      (c) => (c as HTMLInputElement).disabled,
    )
    if (disabledCheckbox) {
      disabledCheckbox.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await nextTick()
    }
    const submitBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('Link selected'))
    expect(submitBtn?.hasAttribute('disabled')).toBe(true)
  })

  it('resets selection when modal opens', async () => {
    wrapper = mountModal()
    const input = (await waitForModal()) as HTMLInputElement
    input.value = 'test'
    input!.dispatchEvent(new Event('input'))
    await nextTick()
    await wrapper.setProps({ open: false })
    await nextTick()
    await wrapper.setProps({ open: true })
    await waitForModal()
    const newInput = document.getElementById('link-provider-search') as HTMLInputElement
    expect(newInput?.value).toBe('')
  })
})
