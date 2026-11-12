# Workflow v1 (React) / v2 (Astro)

## Obiettivo
- **v1**: applicazione React/Next attuale (stabile, deployata alla root del sito).
- **v2**: migrazione Astro + Svelte islands (sperimentale), deployata in sottopath `/v2/`.
- Deploy combinato su GitHub Pages: v1 alla root, v2 in `/prigetto/v2/` (stesso artifact).

## Branch
- **`main`**: sorgente per lo sviluppo e le fix della **v1**. Rappresenta la versione stabile.
- **`feat/astro-migration`**: sviluppo della **v2** (`astro/`, OpenSpec/BMAD, adattamenti condivisi) e configurazione del deploy combinato.

## Come modificare la v1
1. Parti da `main` aggiornato:
   ```bash
   git checkout main
   git pull origin main
   ```
2. (Consigliato) crea un branch di lavoro:
   ```bash
   git checkout -b fix/v1-descrizione
   # oppure feat/v1-descrizione
   ```
3. Apporta le modifiche alla v1 (codice Next/React, `app/`, build `npm run build` → `out/`, ecc.).
4. Verifica localmente:
   ```bash
   npm ci
   npm run lint
   npm run build
   npm run test:genogram
   ```
5. Apri PR verso `main` (o merge su `main` secondo il flusso del repo) e push.
6. **Sync verso v2 (automatico):** al push su `main` l’Action `Sync main into astro migration` tenta il merge `main` → `feat/astro-migration`.
   - Se il merge riesce: `feat/astro-migration` viene aggiornato e il deploy combinato potrà includere la v1 aggiornata.
   - Se ci sono conflitti: viene aperta/aggiornata una PR `main` → `feat/astro-migration` per risolverli manualmente.

## Come modificare la v2
1. Lavora su `feat/astro-migration`:
   ```bash
   git checkout feat/astro-migration
   git pull origin feat/astro-migration
   ```
2. Modifiche in `astro/` (e eventuali file condivisi/OpenSpec).
3. Verifica:
   ```bash
   cd astro
   npm install
   npm run build
   node smoke.mjs
   ```
4. Commit e push su `feat/astro-migration`.

## Deploy GitHub Pages (combinato)
- Workflow: `.github/workflows/pages.yml`
- Trigger: push su `main` e `workflow_dispatch`.
- Build:
  - React: `BASE_PATH=/prigetto`, `npm run build` → `out/` (pubblicato alla root dell’artifact)
  - Astro: `BASE_PATH=/prigetto/v2`, build in `astro/` → `astro/dist/` (pubblicato in `v2/`)
- Artifact combinato: root = v1, `v2/` = v2.
- **Non modificare** il comportamento/output della v1 alla root se non intenzionale; il sito online esistente deve restare funzionante.

## Sync automatico
- Workflow: `.github/workflows/sync-main-to-astro.yml`
- Su push a `main`: merge automatico in `feat/astro-migration`, oppure PR di risoluzione conflitti.
- Permessi richiesti: Actions con `contents: write` e `pull-requests: write` (e, se necessario, abilitare la creazione PR da Actions nelle impostazioni del repo).

## Regole pratiche
- Non committare segreti/token; non pushare `node_modules`, `dist`, `.astro`, `out` (gestiti da `.gitignore`/build).
- Per test locale del deploy combinato con i base path di Pages, servire una struttura che esponga `/prigetto/` e `/prigetto/v2/`.
- Prima di mergeare cambi che impattano il deploy, verificare che la build combinata produca v1 invariata alla root e v2 in `/v2/`.
