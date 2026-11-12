# Proposal: ai-agent-friendly-astro-migration

## Why

Rendere Genogram Canvas AI-agent friendly (chat terapeutica in-app, LLM configurabile) e migliorare la timeline con eventi relazionali condivisi e vista editor dedicata. Contestualmente migrare lo stack frontend da Next.js/React ad Astro static (con Svelte solo dove necessario) per deploy su GitHub Pages, secondo preferenza utente.

## What Changes

- Migrazione frontend a **Astro (output static)** senza React; uso di **Svelte islands** solo per componenti interattivi complessi (editor canvas, pannelli AI/timeline).
- Reimplementazione editor genogramma, dashboard, routing e persistenza client-side nel nuovo stack.
- Esperienza conversazionale AI in-app con endpoint configurabile, preset provider (incl. OpenCodeGo), caricamento dinamico modelli, test connessione e gestione errori/CORS. **Preferenza:** API dirette dal client (compatibili con deploy GH Pages) quando possibile; MCP come fallback/opzionale.
- Applicazione dati **incrementale** dal chat al progetto (merge, no replace totale).
- Timeline evoluta: eventi condivisi multi-entità (persone, luoghi), timeline persona/globale, **vista editor timeline** con widget entità collegate.
- Aggiornamento modello dati/validazione per eventi e compatibilità.

## Capabilities

### New Capabilities

- `ai-conversational-assistant`: chat terapeutica in-app con configurazione LLM, test connessione e merge incrementale dei dati nel genogramma.
- `timeline-editor`: gestione eventi temporali condivisi (persone/luoghi) con viste persona/globale e vista editor timeline.
- `astro-static-migration`: porting dell'app Genogram Canvas a Astro static (Svelte islands dove necessario) con parità funzionale core e deploy GH Pages.

### Modified Capabilities

- Nessuna capability OpenSpec esistente in questo repository (nuovo change).

## Impact

- Codice: `app/`, componenti editor, store, routing, build config; nuovo progetto/struttura Astro.
- Librerie: rimozione dipendenze React/Next/React Flow/Zustand a favore di Astro/Svelte/Svelte Flow/store equivalenti; riuso logica TS pura (`lib/genogram/*`).
- Dati: estensione schema eventi/validazione e migrazione compatibile.
- Deploy: pipeline/build verso output statico Astro per GitHub Pages.

## Note BMAD

Questa proposal deriva dal PRD approvato (gate 1) e dal design approvato (gate 2) in `.bmad/prd-ai-agent-friendly.md` (sintesi in conversazione) e `.bmad/design-ai-agent-friendly.md`. Entrambi approvati dall'utente.
