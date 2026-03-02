import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StateLoading from './StateLoading.vue'

describe('StateLoading', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(StateLoading)
    expect(wrapper.find('.state-loading').exists()).toBe(true)
    expect(wrapper.get('.state-loading').attributes('role')).toBe('status')
    expect(wrapper.get('.state-loading').attributes('aria-label')).toBe('Loading')
  })

  it('renders custom slot content', () => {
    const wrapper = mount(StateLoading, {
      slots: { default: '<p>Custom loading...</p>' },
    })
    expect(wrapper.text()).toContain('Custom loading...')
  })
})
