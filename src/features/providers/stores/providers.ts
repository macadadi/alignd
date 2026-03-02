import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Provider } from '@/shared/types/domain'
import { fetchProviders } from '../api/providers'
import { createLoadable } from '@/shared/stores/createLoadable'

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

  function getById(id: string): Provider | undefined {
    return items.value.find((provider) => provider.id === id)
  }

  return {
    items,
    isLoading: loadable.isLoading,
    error: loadable.error,
    hasLoaded: loadable.hasLoaded,
    load,
    getById,
  }
})
