<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import type { Provider } from '@/shared/types/domain'
import { useSearchInput } from '@/shared/composables/useSearchInput'
import { filterProvidersBySearch } from '@/shared/utils/filters'

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

const { searchQuery, debouncedSearch, setSearch } = useSearchInput(250)
const selectedProviderIds = ref<Set<string>>(new Set())

function resetSelectionState(): void {
  setSearch('')
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
    :breakpoints="{ '960px': '90vw', '640px': '100vw' }"
    @update:visible="(value) => { if (!value) close() }"
  >
    <div class="modal-content">
      <span class="control-group">
        <label for="link-provider-search">Search providers</label>
        <InputText
          id="link-provider-search"
          :model-value="searchQuery"
          placeholder="Find by provider name"
          @update:model-value="setSearch(String($event ?? ''))"
        />
      </span>

      <DataTable
        :value="availableProviders"
        scrollable
        scroll-height="320px"
        responsive-layout="stack"
        breakpoint="960px"
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

.actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .modal-content {
    gap: 0.75rem;
  }

  .actions {
    flex-direction: column;
  }

  .actions .p-button {
    min-height: 44px;
    width: 100%;
  }
}

.error-message {
  margin: 0;
  color: var(--color-error);
}
</style>
