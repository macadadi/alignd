import { ref } from 'vue'
import { useDebounce } from './useDebounce'

/**
 * Composable for search input with debouncing.
 * @param debounceMs - Debounce delay in milliseconds
 */
export function useSearchInput(debounceMs = 250) {
  const searchQuery = ref('')

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
