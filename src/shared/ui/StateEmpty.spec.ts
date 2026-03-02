import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StateEmpty from './StateEmpty.vue'

describe('StateEmpty', () => {
  it('renders with default slot', () => {
    const wrapper = mount(StateEmpty)
    expect(wrapper.find('.state-empty').exists()).toBe(true)
    expect(wrapper.get('.state-empty').attributes('role')).toBe('status')
    expect(wrapper.text()).toContain('No items yet')
  })

  it('renders custom slot content', () => {
    const wrapper = mount(StateEmpty, {
      slots: { default: '<p>No patients found</p>' },
    })
    expect(wrapper.text()).toContain('No patients found')
  })
})
