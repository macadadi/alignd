import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/patients', component: { template: '<div>Patients</div>' } },
    { path: '/providers', component: { template: '<div>Providers</div>' } },
  ],
})

describe('App', () => {
  it('renders header and nav', async () => {
    await router.push('/')
    const wrapper = mount(App, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Healthcare Dashboard')
    expect(wrapper.find('nav').exists()).toBe(true)
    expect(wrapper.findAll('a').length).toBeGreaterThanOrEqual(2)
  })
})
