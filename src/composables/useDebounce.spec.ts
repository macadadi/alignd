import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useDebounce } from './useDebounce'

function createDebounceWrapper(source: ReturnType<typeof ref>, ms: number) {
  return mount({
    template: '<span>{{ debounced }}</span>',
    setup() {
      const debounced = useDebounce(() => source.value, ms)
      return { debounced }
    },
  })
}

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const source = ref('hello')
    const wrapper = createDebounceWrapper(source, 250)
    expect(wrapper.text()).toBe('hello')
    wrapper.unmount()
  })

  it('updates after debounce delay', async () => {
    const source = ref('a')
    const wrapper = createDebounceWrapper(source, 250)
    expect(wrapper.text()).toBe('a')

    source.value = 'b'
    await nextTick()
    expect(wrapper.text()).toBe('a')

    vi.advanceTimersByTime(250)
    await nextTick()
    expect(wrapper.text()).toBe('b')
    wrapper.unmount()
  })

  it('resets timer on rapid changes', async () => {
    const source = ref('a')
    const wrapper = createDebounceWrapper(source, 250)

    source.value = 'b'
    await nextTick()
    vi.advanceTimersByTime(100)
    source.value = 'c'
    await nextTick()
    vi.advanceTimersByTime(100)
    source.value = 'd'
    await nextTick()
    vi.advanceTimersByTime(250)
    await nextTick()

    expect(wrapper.text()).toBe('d')
    wrapper.unmount()
  })

  it('updates after delay when used in component', async () => {
    const source = ref('a')
    const TestComp = {
      template: '<span>{{ debounced }}</span>',
      setup() {
        const debounced = useDebounce(() => source.value, 250)
        return { debounced }
      },
    }
    const wrapper = mount(TestComp)
    expect(wrapper.text()).toBe('a')

    source.value = 'b'
    await nextTick()
    vi.advanceTimersByTime(250)
    await nextTick()
    expect(wrapper.text()).toBe('b')
  })
})
