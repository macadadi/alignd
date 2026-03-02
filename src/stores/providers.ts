import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Provider } from '@/types/domain'
import { fetchProviders } from '@/services/api'
import { createLoadable } from './createLoadable'

export const useProvidersStore = defineStore('providers', () => {
  const items = ref<Provider[]>([])
  const loadable = createLoadable()

  function hydrate(providers: Provider[]): void {
    items.value = [...providers]
  }

  async function load(force = false): Promise<void> {
    await loadable.run(async () => {
      const providers = await fetchProviders()
      hydrate(providers)
    }, force)
  }

  return {
    items,
    isLoading: loadable.isLoading,
    error: loadable.error,
    hasLoaded: loadable.hasLoaded,
    load,
  }
})
