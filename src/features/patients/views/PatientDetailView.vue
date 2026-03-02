<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Badge from '@/shared/ui/Badge.vue'
import StateLoading from '@/shared/ui/StateLoading.vue'
import StateError from '@/shared/ui/StateError.vue'
import StateEmpty from '@/shared/ui/StateEmpty.vue'
import { persistProviderLinks } from '../api/patients'
import { usePatientsStore } from '../stores/patients'
import { useProvidersStore } from '@/features/providers/stores/providers'

const LinkProviderModal = defineAsyncComponent(() => import('../components/LinkProviderModal.vue'))

const route = useRoute()
const router = useRouter()
const patientsStore = usePatientsStore()
const providersStore = useProvidersStore()
const linkModalOpen = ref(false)

const patientId = computed(() => String(route.params.id ?? ''))
const patient = computed(() => patientsStore.getById(patientId.value))
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const linkedProviders = computed(() => {
  if (!patient.value) return []
  const linkedProviderIds = new Set(patient.value.providerIds)
  return providersStore.items.filter((provider) => linkedProviderIds.has(provider.id))
})

const sortedClinicalSummary = computed(() => {
  if (!patient.value) return []
  return [...patient.value.clinicalSummary].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
})

const isSubmitting = ref(false)
const mutationError = ref('')

function openModal(): void {
  mutationError.value = ''
  linkModalOpen.value = true
}

function closeModal(): void {
  linkModalOpen.value = false
}

function formatDate(date: string): string {
  return dateFormatter.format(new Date(date))
}

async function onConfirm(providerIds: string[]): Promise<void> {
  if (!patient.value) return

  mutationError.value = ''
  const optimistic = patientsStore.linkProvidersOptimistic(patient.value.id, providerIds)

  if (optimistic.addedIds.length === 0) {
    closeModal()
    return
  }

  isSubmitting.value = true
  try {
    await persistProviderLinks(patient.value.id, optimistic.addedIds)
    closeModal()
  } catch (error) {
    optimistic.rollback()
    mutationError.value = error instanceof Error ? error.message : 'Failed to link providers.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await Promise.all([patientsStore.load(), providersStore.load()])
})
</script>

<template>
  <section class="view">
    <StateLoading v-if="patientsStore.isLoading || providersStore.isLoading" />
    <StateError
      v-else-if="Boolean(patientsStore.error) || Boolean(providersStore.error)"
      @retry="() => { patientsStore.load(true); providersStore.load(true) }"
    />
    <StateEmpty v-else-if="!patient">
      <p class="not-found">Patient was not found.</p>
      <Button label="Back to patients" severity="secondary" @click="router.push('/patients')" />
    </StateEmpty>

    <template v-else>
      <header class="view-header">
        <div>
          <h2>{{ patient.fullName }}</h2>
          <p>{{ patient.id }}</p>
        </div>
        <Button label="Link Provider" @click="openModal" />
      </header>

      <article class="panel">
        <h3>Patient information</h3>
        <dl class="details-grid">
          <div>
            <dt>Full Name</dt>
            <dd>{{ patient.fullName }}</dd>
          </div>
          <div>
            <dt>Membership Number</dt>
            <dd>{{ patient.membershipNumber }}</dd>
          </div>
          <div>
            <dt>Scheme Administrator</dt>
            <dd>{{ patient.schemeAdministrator }}</dd>
          </div>
          <div>
            <dt>Dependency Code</dt>
            <dd>{{ patient.dependencyCode }}</dd>
          </div>
          <div>
            <dt>Programme Name &amp; Type</dt>
            <dd>{{ patient.programmeName }} - {{ patient.programmeType }}</dd>
          </div>
          <div>
            <dt>Programme Phase</dt>
            <dd>{{ patient.programmePhase }}</dd>
          </div>
          <div>
            <dt>Provider Count</dt>
            <dd>
              <Badge>{{ patient.providerIds.length }} linked providers</Badge>
            </dd>
          </div>
          <div class="details-grid__wide">
            <dt>Address</dt>
            <dd>
              {{ patient.address.street }}, {{ patient.address.suburb }},
              {{ patient.address.city }}, {{ patient.address.province }},
              {{ patient.address.postalCode }}
            </dd>
          </div>
        </dl>
      </article>

      <article class="panel">
        <h3>Linked providers</h3>
        <p v-if="linkedProviders.length === 0" class="muted">No linked providers yet.</p>
        <ul v-else class="linked-list">
          <li v-for="provider in linkedProviders" :key="provider.id">
            <span>{{ provider.name }}</span>
            <small>{{ provider.type }}</small>
          </li>
        </ul>
      </article>

      <article class="panel">
        <h3>Clinical summary history</h3>
        <p v-if="sortedClinicalSummary.length === 0" class="muted">
          No clinical notes available yet.
        </p>
        <ul v-else class="clinical-list">
          <li v-for="entry in sortedClinicalSummary" :key="entry.id" class="clinical-item">
            <div class="clinical-item__header">
              <strong>{{ entry.providerName }}</strong>
              <small>{{ formatDate(entry.date) }}</small>
            </div>
            <p>{{ entry.comment }}</p>
          </li>
        </ul>
      </article>
    </template>

    <LinkProviderModal
      v-if="linkModalOpen"
      :open="linkModalOpen"
      :providers="providersStore.items"
      :linked-provider-ids="patient?.providerIds ?? []"
      :is-submitting="isSubmitting"
      :error-message="mutationError"
      @close="closeModal"
      @confirm="onConfirm"
    />
  </section>
</template>

<style scoped>
.view {
  display: grid;
  gap: 1rem;
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

@media (max-width: 640px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .view-header .p-button {
    min-height: 44px;
  }
}

h2,
h3 {
  margin: 0;
}

p {
  margin: 0.25rem 0 0;
}

.panel {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1rem;
}

.details-grid {
  margin: 0.75rem 0 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 0.75rem;
}

.details-grid dt {
  font-size: 0.78rem;
  text-transform: uppercase;
  font-weight: 700;
  opacity: 0.75;
}

.details-grid dd {
  margin: 0.2rem 0 0;
}

.details-grid__wide {
  grid-column: 1 / -1;
}

.linked-list {
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.5rem;
}

.linked-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0.625rem 0.75rem;
}

.clinical-list {
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.75rem;
}

.clinical-item {
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.clinical-item__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}

.clinical-item p {
  margin: 0.5rem 0 0;
}

.muted {
  opacity: 0.75;
}

.not-found {
  margin-bottom: 0.75rem;
}

@media (max-width: 960px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .panel {
    padding: 0.875rem;
  }

  .linked-list li {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    padding: 0.75rem;
  }

  .clinical-item__header {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
