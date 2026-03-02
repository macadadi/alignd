<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import type { Provider } from '@/types/domain'
import { useDebounce } from '@/composables/useDebounce'
import { filterProvidersBySearch } from '@/utils/selectors'

interface Props {
  open: boolean
  providers: Provider[]
  linkedProviderIds: string[]
  isSubmitting: boolean
  errorMessage: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: [providerIds: string[]]
}>()

const searchQuery = ref('')
const selectedProviderIds = ref<Set<string>>(new Set())
const debouncedSearch = useDebounce(() => searchQuery.value, 250)

function setSearchQuery(value: string): void {
  searchQuery.value = value
}

function resetSelectionState(): void {
  searchQuery.value = ''
  selectedProviderIds.value = new Set()
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) resetSelectionState()
  },
)

interface LinkProviderRow {
  id: string
  name: string
  type: string
  disabled: boolean
}

const availableProviders = computed<LinkProviderRow[]>(() =>
  filterProvidersBySearch(props.providers, debouncedSearch.value).map((provider) => ({
    id: provider.id,
    name: provider.name,
    type: provider.type,
    disabled: props.linkedProviderIds.includes(provider.id),
  })),
)

const canSubmit = computed(
  () => !props.isSubmitting && selectedProviderIds.value.size > 0,
)

function close(): void {
  emit('close')
}

function toggle(providerId: string, disabled: boolean): void {
  if (disabled) return
  const next = new Set(selectedProviderIds.value)
  if (next.has(providerId)) next.delete(providerId)
  else next.add(providerId)
  selectedProviderIds.value = next
}

function confirmSelection(): void {
  emit('confirm', Array.from(selectedProviderIds.value))
}
</script>

<template>
  <Dialog
    :visible="open"
    header="Link providers"
    modal
    :style="{ width: 'min(920px, 95vw)' }"
    @update:visible="(value) => { if (!value) close() }"
  >
    <div class="modal-content">
      <span class="control-group">
        <label for="link-provider-search">Search providers</label>
        <InputText
          id="link-provider-search"
          :model-value="searchQuery"
          placeholder="Find by provider name"
          @update:model-value="setSearchQuery(String($event ?? ''))"
        />
      </span>

      <DataTable
        :value="availableProviders"
        scrollable
        scroll-height="320px"
        responsive-layout="scroll"
      >
        <Column header="" style="width: 64px">
          <template #body="{ data }">
            <Checkbox
              binary
              :model-value="selectedProviderIds.has(data.id)"
              :disabled="data.disabled"
              @update:model-value="toggle(data.id, data.disabled)"
            />
          </template>
        </Column>
        <Column field="name" header="Provider Name" />
        <Column field="type" header="Provider Type" />
        <Column header="Status">
          <template #body="{ data }">
            <Tag :value="data.disabled ? 'Already linked' : 'Available'" :severity="data.disabled ? 'warn' : 'success'" />
          </template>
        </Column>
      </DataTable>

      <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>

      <div class="actions">
        <Button label="Cancel" severity="secondary" :disabled="isSubmitting" @click="close" />
        <Button
          :label="isSubmitting ? 'Linking...' : 'Link selected providers'"
          :disabled="!canSubmit"
          @click="confirmSelection"
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.modal-content {
  display: grid;
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.error-message {
  margin: 0;
  color: var(--color-error);
}
</style>

