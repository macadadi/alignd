<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Badge from '@/shared/ui/Badge.vue'
import StateLoading from '@/shared/ui/StateLoading.vue'
import StateError from '@/shared/ui/StateError.vue'
import StateEmpty from '@/shared/ui/StateEmpty.vue'
import { useProvidersStore } from '../stores/providers'
import { usePatientsStore } from '@/features/patients/stores/patients'
import { pluralize } from '@/shared/utils/format'

const route = useRoute()
const router = useRouter()
const providersStore = useProvidersStore()
const patientsStore = usePatientsStore()

const providerId = computed(() => String(route.params.id ?? ''))
const provider = computed(() => providersStore.getById(providerId.value))

const linkedPatients = computed(() => {
  if (!provider.value) return []
  return patientsStore.items.filter((patient) =>
    patient.providerIds.includes(provider.value!.id),
  )
})

function goBackToProviders(): void {
  const fromListQuery = (history.state as { fromListQuery?: Record<string, string> } | null)
    ?.fromListQuery
  if (fromListQuery) {
    router.push({ path: '/providers', query: fromListQuery })
  } else if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ path: '/providers' })
  }
}

function navigateToPatient(patientId: string): void {
  router.push(`/patients/${patientId}`)
}

onMounted(async () => {
  await Promise.all([providersStore.load(), patientsStore.load()])
})
</script>

<template>
  <section class="view">
    <StateLoading v-if="providersStore.isLoading || patientsStore.isLoading" />
    <StateError
      v-else-if="Boolean(providersStore.error) || Boolean(patientsStore.error)"
      @retry="() => { providersStore.load(true); patientsStore.load(true) }"
    />
    <StateEmpty v-else-if="!provider">
      <p class="not-found">Provider was not found.</p>
      <Button
        label="Back to providers"
        severity="secondary"
        @click="goBackToProviders"
      />
    </StateEmpty>

    <template v-else>
      <header class="view-header">
        <div>
          <h2>{{ provider.name }}</h2>
          <p>{{ provider.id }}</p>
        </div>
        <Button
          label="Back to providers"
          severity="secondary"
          @click="goBackToProviders"
        />
      </header>

      <article class="panel">
        <h3>Provider information</h3>
        <dl class="details-grid">
          <div>
            <dt>Provider Name</dt>
            <dd>{{ provider.name }}</dd>
          </div>
          <div>
            <dt>Provider Type</dt>
            <dd>{{ provider.type }}</dd>
          </div>
          <div>
            <dt>Patient Count</dt>
            <dd>
              <Badge>{{ pluralize(linkedPatients.length, 'linked patient', 'linked patients') }}</Badge>
            </dd>
          </div>
        </dl>
      </article>

      <article class="panel">
        <h3>Linked patients</h3>
        <p v-if="linkedPatients.length === 0" class="muted">No linked patients yet.</p>
        <ul v-else class="linked-list">
          <li
            v-for="patient in linkedPatients"
            :key="patient.id"
            class="linked-list__item--clickable"
            role="button"
            tabindex="0"
            @click="navigateToPatient(patient.id)"
            @keydown.enter="navigateToPatient(patient.id)"
            @keydown.space.prevent="navigateToPatient(patient.id)"
          >
            <span>{{ patient.fullName }}</span>
            <small>{{ patient.membershipNumber }}</small>
          </li>
        </ul>
      </article>
    </template>
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

.linked-list__item--clickable {
  cursor: pointer;
}

@media (hover: hover) {
  .linked-list__item--clickable:hover {
    background: color-mix(in srgb, var(--color-background-mute) 65%, transparent);
  }
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
}
</style>
