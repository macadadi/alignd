import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StateNoResults from './StateNoResults.vue'

describe('StateNoResults', () => {
  it('renders with default slot', () => {
    const wrapper = mount(StateNoResults)
    expect(wrapper.find('.state-no-results').exists()).toBe(true)
    expect(wrapper.get('.state-no-results').attributes('role')).toBe('status')
    expect(wrapper.text()).toContain('No results match your search')
  })

  it('renders custom slot content', () => {
    const wrapper = mount(StateNoResults, {
      slots: { default: '<p>Try different filters</p>' },
    })
    expect(wrapper.text()).toContain('Try different filters')
  })
})
