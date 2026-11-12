# Design: ai-agent-friendly-astro-migration

## Context

Genogram Canvas è oggi un'app Next.js/React con export statico, editor basato su React Flow e stato Zustand. Sono stati prototipati pannello AI e timeline base nel fork attuale. L'utente richiede migrazione a stack senza React (Astro, Svelte solo se necessario), mantenendo deploy su GH Pages, più funzionalità AI e timeline relazionale/editor.

Riferimento: `.bmad/design-ai-agent-friendly.md`.

## Goals / Non-Goals

**Goals:**
- Ottenere build statico Astro deployabile su GH Pages senza React.
- Portare funzionalità core (editor, dashboard, persistenza, import/export).
- Fornire chat AI configurabile con merge incrementale e UX connessione/CORS.
- Fornire timeline con eventi condivisi persone/luoghi e vista editor dedicata.
- Riusare/adattare logica TS pura e test dove possibile.

**Non-Goals:**
- Backend/proxy server-side per LLM (fuori scope GH Pages).
- Parità pixel-perfect immediata; priorità a funzionalità core.
- Supporto browser legacy non target dell'app attuale.

## Decisions

- **Astro static + Svelte islands:** Astro per shell/routing/statico; Svelte per editor grafo e UI interattiva complessa. Alternativa scartata: SPA React mantenuta.
- **Svelte Flow:** valutare `@xyflow/svelte` per sostituire React Flow; fallback implementazione custom se gap critici. Razionale: continuità modello grafo.
- **Stato:** Svelte stores/nanostores. Razionale: integrazione naturale con Astro/Svelte.
- **Riuso lib pure:** mantenere `model`, validazione, persistenza idb, generazione spec, MCP separato. Razionale: ridurre regressioni.
- **Merge incrementale AI:** parsing spec LLM e merge deterministico nel progetto (match/update/add con deduplica) invece di replace. Razionale: preservare lavoro utente.
- **Eventi timeline:** estendere schema con collegamenti multi-entità (persone, luoghi) e vista editor; migrazione compatibile. Razionale: eventi familiari non 1:1.

## Risks / Trade-offs

- [Complessità porting editor] → Spike Svelte Flow e migrazione per fasi, checklist parità.
- [Gap Svelte Flow vs React Flow] → Valutazione precoce; fallback custom limitato alle feature necessarie.
- [CORS/endpoint privati] → Test connessione e messaggi chiari; documentazione limiti.
- [Merge incoerente] → Regole di matching/deduplica e validazione `validateProject`.
- [Rottura schema dati] → Versioning/retrocompatibilità e migrazione lettura progetti esistenti.

## Migration Plan

1. Bootstrap Astro static e struttura progetto.
2. Porting `lib/genogram` e test logica.
3. Dashboard/import/export/persistenza in nuovo stack.
4. Editor canvas con Svelte Flow e store.
5. AI panel (config, test, modelli, chat, merge incrementale).
6. Timeline modello+UI (persona/globale/editor, eventi condivisi persone/luoghi).
7. Verifica build/test, deploy GH Pages, cutover e cleanup Next/React.

Rollback: mantenere branch/fork React funzionante fino a cutover completato.

## Open Questions

- Scelta definitiva tra `@xyflow/svelte` e canvas custom per casi edge.
- Strategia esatta di matching entità nel merge incrementale (nome vs chiavi stabili).
- Rappresentazione "luoghi" nel modello (entità first-class o attributi evento) — da dettagliare in spec durante implementazione.
