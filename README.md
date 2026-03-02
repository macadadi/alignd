# Alignd Healthcare Dashboard

Production-focused Vue 3 + TypeScript dashboard for patient and provider workflows.

## Architecture Overview

- **Single data layer:** Pinia domain stores fetch, own, and mutate `patients` and `providers`.
- **Local UI state:** search inputs and modal selection state live in their corresponding views/components.
- **Data source:** all mock data comes from `api-responses/patients.json` and `api-responses/providers.json` via service adapters.

## Why This Architecture

- **Fewer moving parts:** one state system avoids query-to-store hydration and duplicate data ownership.
- **Safer mutations:** link-provider optimistic updates are centralized in the patient store, with rollback on failure.
- **Typed contracts:** DTO-to-domain adapters isolate API shape from UI shape.

## Tradeoffs

- **Pros**
  - Clear separation of concerns across fetching, domain logic, and view rendering.
  - Optimistic linking keeps UI responsive without waiting for round-trips.
  - Easier future API migration because services/adapters are isolated.
- **Cons**
  - Stores own loading/error states, so fetch behavior is less plug-and-play than a query library.
  - Optimistic flows need explicit rollback paths and error UX handling.

## Current Feature Surface

- Routes:
  - `/patients`
  - `/patients/:id`
  - `/providers`
- Required view states on list/detail surfaces:
  - loading
  - error (with retry)
  - empty
  - no-results
- Scrollable table rendering for large lists and provider picker modal.
- Optimistic provider linking from patient detail.

## Project Structure

```text
src/
  components/
    patients/         # Link-provider modal
    primitives/       # AppButton/AppInput/AppModal
    shared/           # Virtual list
    state/            # loading/error/empty/no-results states
  composables/        # Reusable client-side helpers (debounce)
  router/             # Route definitions
  services/api/       # API client, adapters, fetch services
  stores/             # Pinia domain stores
  types/              # DTO/domain contracts
  utils/              # Typed selectors
  views/              # Patients list/detail, providers list
api-responses/        # JSON mock responses
```

## Getting Started

```sh
npm install
npm run dev
```

## Quality Checks

```sh
npm run type-check
npm run lint
npm run build
```
