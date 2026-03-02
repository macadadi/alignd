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
      component: () => import('../views/PatientsListView.vue'),
    },
    {
      path: '/patients/:id',
      name: 'patient-detail',
      component: () => import('../views/PatientDetailView.vue'),
    },
    {
      path: '/providers',
      name: 'providers',
      component: () => import('../views/ProvidersListView.vue'),
    },
  ],
})

export default router
