import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useSearchInput } from './useSearchInput'

function createWrapper(debounceMs = 250) {
  return mount({
    template: '<span>{{ debounced }}</span>',
    setup() {
      const { searchQuery, debouncedSearch, setSearch } = useSearchInput(debounceMs)
      return { debounced: debouncedSearch, searchQuery, setSearch }
    },
  })
}

describe('useSearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial empty search', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toBe('')
    wrapper.unmount()
  })

  it('updates debounced value after delay', async () => {
    const wrapper = createWrapper()
    ;(wrapper.vm as unknown as { setSearch: (v: string) => void }).setSearch('hello')
    await nextTick()
    expect(wrapper.text()).toBe('')

    vi.advanceTimersByTime(250)
    await nextTick()
    expect(wrapper.text()).toBe('hello')
    wrapper.unmount()
  })
})
