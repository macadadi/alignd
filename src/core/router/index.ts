import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/patients',
    },
    {
      path: '/patients',
      name: 'patients',
      component: () => import('@/features/patients/views/PatientsListView.vue'),
    },
    {
      path: '/patients/:id',
      name: 'patient-detail',
      component: () => import('@/features/patients/views/PatientDetailView.vue'),
    },
    {
      path: '/providers',
      name: 'providers',
      component: () => import('@/features/providers/views/ProvidersListView.vue'),
    },
    {
      path: '/providers/:id',
      name: 'provider-detail',
      component: () => import('@/features/providers/views/ProviderDetailView.vue'),
    },
  ],
})

export default router
