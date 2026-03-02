import { ref } from 'vue'

export function createLoadable() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasLoaded = ref(false)

  async function run(task: () => Promise<void>, force = false): Promise<void> {
    if (isLoading.value) return
    if (hasLoaded.value && !force) return

    isLoading.value = true
    error.value = null
    try {
      await task()
      hasLoaded.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load data.'
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    hasLoaded,
    run,
  }
}
