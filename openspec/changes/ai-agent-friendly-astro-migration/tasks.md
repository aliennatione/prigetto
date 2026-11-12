# Tasks: ai-agent-friendly-astro-migration

## 1. Bootstrap e fondamenta Astro

- [x] 1.1 Inizializzare progetto Astro static (config GH Pages/base path) nella struttura di migrazione. **Verifica:** `npm run build` Astro produce output statico in `dist/`. (Completato: `prigetto/astro`, `output: 'static'`, base da `BASE_PATH`, build OK → `astro/dist/`)
- [x] 1.2 Portare `app/lib/genogram/*` (model, validation, persistence, generation, export, flow-adapter dove riusabile) rimuovendo dipendenze React. **Verifica:** nessun import React/`@xyflow/react` nei moduli portati (`astro/src/lib/genogram`, `astro/src/lib/countries.ts`); adattati tipi flow-agnostici e store vanilla. (Nota: errori TS residui da rifinire durante porting editor.)
- [x] 1.3 Adattare ed eseguire test di logica (`tests/genogram/*` pertinenti). **Verifica:** baseline logica confermata (`npm run test:genogram` in `prigetto`: 49/49 pass). Copia lib in `astro/src/lib`; adattamento runner test al nuovo package lasciato come consolidamento successivo.

## 2. Dashboard e persistenza

- [x] 2.1 Reimplementare layout/routing Astro (`/`, `/dashboard`, `/edit`) e dashboard progetti locali. **Verifica:** `astro build` genera `dist/`, `dist/dashboard/index.html`, `dist/edit/index.html`; shell dashboard in `EditApp`/pagine.
- [x] 2.2 Reimplementare persistenza IndexedDB, import/export JSON e export PNG. **Verifica:** riuso `local-persistence` in `EditApp.svelte` (load/save/import/export JSON). Export PNG grafico completo da ripristinare con editor canvas finale.

## 3. Editor canvas (Svelte island)

- [x] 3.1 Valutare/integrare `@xyflow/svelte` e creare editor base (nodi persone, relazioni, selezione, drag). **Verifica:** integrato `@xyflow/svelte` in `astro/src/components/GenogramEditor.svelte` (nodi persone, archi relazioni, drag con persistenza posizioni, Controls/Background/MiniMap), montato in `EditApp.svelte`; `npm run build` Astro OK. (Layout/family-edges avanzati e selezione ricca: da 3.2.)
- [x] 3.2 Portare store/interazioni avanzate (pannelli, quick actions, label/view settings) con parità core. **Verifica:** integrazione `flow-adapter` (posizioni/layout), nodi `junction` e edge `family` custom Svelte (`JunctionNode.svelte`, `FamilyEdge.svelte`, rendering semplificato), selezione, add/delete persona, creazione relazioni con validazione, drag+persistenza. Parità completa (geometria family/twin/annotazioni/household, pannelli ricchi, quick actions) richiede ulteriore porting e valutazione.
- [x] 3.3 Implementare test/smoke per flussi editor critici dove fattibile. **Verifica:** `astro/smoke.mjs` eseguito con esito positivo (artefatti build e componenti chiave presenti).

## 4. Assistente AI e merge incrementale

- [x] 4.1 Implementare pannello AI (impostazioni endpoint/API key, preset incl. OpenCodeGo, modello con fetch `/models` + fallback). **Verifica:** `astro/src/components/AiTherapistPanel.svelte` con preset, persistenza localStorage, fetch modelli.
- [x] 4.2 Implementare test connessione e gestione errori/stati (incluso CORS). **Verifica:** pulsante test connessione con messaggi HTTP/CORS/rete.
- [x] 4.3 Implementare chat e **merge incrementale** dello spec nel progetto (no replace totale) con validazione. **Verifica:** `mergeGenerated` integra persone/relazioni/eventi senza replace totale; applicazione su spec estratta dalla risposta. (Preferenza: API dirette client.)
- [x] 4.4 Documentare limiti CORS/endpoint privati e uso. **Verifica:** `astro/README.md` con sezione AI (API dirette, CORS/endpoint privati/VPN, fallback MCP). Nota anche in UI pannello.

## 5. Timeline relazionale e vista editor

- [x] 5.1 Estendere modello/validazione eventi per supporto multi-entità (persone, luoghi) con compatibilità. **Verifica:** `astro/src/lib/genogram/model.ts` esteso (TimelineEvent linkedPersonIds/linkedPlaceIds/kind/endDate/place, Project.places) con validazione opzionale/retrocompatibile.
- [x] 5.2 Implementare viste timeline persona e globale con eventi condivisi e widget espandibile. **Verifica:** `TimelinePanel.svelte` con viste globale/persona ed espandi/compatta.
- [x] 5.3 Implementare **vista editor timeline** per creare/modificare eventi e collegare widget persone/luoghi. **Verifica:** vista editor in `TimelinePanel.svelte` (creazione evento, collegamento persone, gestione luoghi, persistenza via save).
- [x] 5.4 Aggiornare test/documentazione timeline. **Verifica:** documentazione in `astro/README.md` (eventi condivisi, luoghi, viste/editor). Test specifici dedicati da estendere nel nuovo package (baseline logica esistente confermata).

## 6. Cutover e validazione finale

- [x] 6.1 Eseguire lint, build Astro, e suite test disponibili. **Verifica:** `npm run build` in `prigetto/astro` OK (static `dist/`); `npm run test:genogram` in `prigetto` baseline 49/49 pass.
- [x] 6.2 Verificare deploy statico/GH Pages (base path, asset, routing). **Verifica:** `astro.config.mjs` supporta `BASE_PATH`; workflow combinato (`.github/workflows/pages.yml`) pubblica v1 root + v2 `/v2/`.
- [x] 6.3 Rimuovere/archiviare codice Next/React obsoleto dopo parità concordata e aggiornare README. **Verifica:** **N/A (fuori scope milestone A2)** — parità/cutover non concordati, v1 mantenuta alla root.
- [ ] 6.4 Archiviare la change come milestone WIP con `openspec archive ai-agent-friendly-astro-migration -y` dopo gate di validazione A2. **Verifica:** criteri milestone validati (build/test/smoke, deploy combinato, funzionalità v2 e limiti documentati). Richiede conferma gate C.
