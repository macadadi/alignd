import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StateError from './StateError.vue'

describe('StateError', () => {
  it('renders error state', () => {
    const wrapper = mount(StateError)
    expect(wrapper.find('.state-error').exists()).toBe(true)
    expect(wrapper.get('.state-error').attributes('role')).toBe('alert')
    expect(wrapper.text()).toContain('Something went wrong')
  })

  it('emits retry when button clicked', async () => {
    const wrapper = mount(StateError, {
      global: { stubs: { Button: { template: '<button @click="$emit(\'click\')">Try again</button>' } } },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('retry')).toBeDefined()
    expect(wrapper.emitted('retry')!.length).toBeGreaterThanOrEqual(1)
  })
})
