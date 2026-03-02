import { onScopeDispose, ref, watch } from 'vue'

/**
 * Debounces a string value. Updates debouncedRef after `ms` of no changes.
 */
export function useDebounce(source: () => string, ms: number) {
  const debounced = ref(source())
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(source, (val) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      debounced.value = val
      timeoutId = null
    }, ms)
  }, { immediate: true })

  onScopeDispose(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  })

  return debounced
}
