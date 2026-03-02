<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div>
        <h1>Healthcare Dashboard</h1>
        <p>Patients and provider relationships</p>
      </div>
      <nav class="nav">
        <RouterLink to="/patients">Patients</RouterLink>
        <RouterLink to="/providers">Providers</RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: grid;
  gap: 1rem;
}

.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
}

@media (max-width: 640px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .nav {
    justify-content: center;
  }
}

h1 {
  margin: 0;
  font-size: 1.25rem;
}

@media (max-width: 640px) {
  h1 {
    font-size: 1.125rem;
  }
}

p {
  margin: 0.25rem 0 0;
  color: var(--color-text);
  opacity: 0.75;
}

.nav {
  display: flex;
  gap: 0.5rem;
}

.nav a {
  padding: 0.5rem 0.75rem;
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid transparent;
}

.nav a.router-link-active {
  border-color: var(--color-border);
  background: var(--color-background);
}
</style>
