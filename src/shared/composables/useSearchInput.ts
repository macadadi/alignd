import { ref } from 'vue'
import { useDebounce } from './useDebounce'

/**
 * Composable for search input with debouncing.
 * @param debounceMs - Debounce delay in milliseconds
 * @param initialValue - Optional initial search value
 */
export function useSearchInput(debounceMs = 250, initialValue = '') {
  const searchQuery = ref(initialValue)

  const debouncedSearch = useDebounce(() => searchQuery.value, debounceMs)

  function setSearch(value: string): void {
    searchQuery.value = value
  }

  return {
    searchQuery,
    debouncedSearch,
    setSearch,
  }
}
