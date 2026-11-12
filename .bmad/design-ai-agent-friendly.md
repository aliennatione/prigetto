# Design — Migrazione ad Astro e funzionalità AI-agent friendly

## 1. Obiettivo
Migrare Genogram Canvas da Next.js/React a **Astro (static output)** mantenendo deploy su GitHub Pages, eliminando React dallo stack principale. Introdurre/maturare funzionalità AI conversazionale e timeline globale/relazionale.

## 2. Decisioni architetturali
- **Framework target:** Astro 4/5 con `output: 'static'`.
- **Interattività complessa:** usare **Svelte solo dove necessario** come Astro islands (editor canvas/grafo, componenti altamente interattivi). Nessun React.
- **Grafico/canvas:** sostituire `@xyflow/react` con `@xyflow/svelte` (Svelte Flow) nell'isola editor, oppure valutare implementazione canvas custom se Svelte Flow insufficiente.
- **Stato client:** sostituire Zustand con store compatibili (es. Svelte stores nell'isola editor, nanostores per stato condiviso leggero tra isole se serve).
- **Persistenza e modello dati:** riusare logica TypeScript pura (`app/lib/genogram/model.ts`, validazione, generazione spec, persistenza IndexedDB/idb) con adattamenti minimi (rimuovere dipendenze React).
- **MCP server:** mantenere separato (Node/TS, esbuild) — indipendente dal frontend.

## 3. Strategia di migrazione
Approccio incrementale a fasi per ridurre rischio:
1. **Bootstrap Astro**: nuovo progetto Astro static in sottocartella o branch di migrazione, routing `/`, `/dashboard`, `/edit`.
2. **Porting librerie pure**: copiare/adattare `lib/genogram/*` (model, validation, persistence, generation, export) e test `test:genogram`.
3. **UI statica/dashboard**: reimplementare layout, dashboard, import/export in Astro/Svelte minimale.
4. **Editor canvas (critico)**: reimplementare editor con Svelte + Svelte Flow, portando store e interazioni (selezione, drag, relazioni, pannelli).
5. **AI panel e timeline**: reimplementare come isole Svelte (chat LLM, settings, test connessione, caricamento modelli, timeline persona/globale).
6. **Parità e rifinitura**: PNG export, label/view settings, shortcut, accessibilità base.
7. **Cutover**: sostituire build/deploy GH Pages con output Astro; rimuovere codice Next/React.

## 4. Funzionalità AI-agent friendly
- **Integrazione preferita:** chiamate **API dirette** dal client (OpenAI-compatible) per la chat/configurazione; MCP server esistente mantenuto separato/opzionale, non come dipendenza principale dell'esperienza in-app.
- **Chat terapeutica**: pannello conversazionale; invio a endpoint OpenAI-compatible `/chat/completions`.
- **Configurazione**: base URL, API key, preset (OpenAI, Groq, Together, Ollama, OpenCodeGo, Custom), selezione modello con fetch dinamico `/models` e fallback manuale.
- **Test connessione**: verifica endpoint, gestione stati/errori e messaggi CORS.
- **Applicazione dati incrementale**: parsing output LLM (spec JSON) e **merge** nel progetto corrente (aggiunta/aggiornamento persone, relazioni, eventi) evitando replace totale; strategia di matching (id/key/nome) e deduplica da definire in implementazione.
- **Privacy/limiti**: esecuzione client-side, dati nel browser; avviso su endpoint esterni/CORS/VPN.

## 5. Timeline
- **Eventi**: estendere modello per supportare eventi condivisi e ricchi (`linkedPersonIds`, `linkedPlaceIds`/luoghi, tipo, data/periodo, note) con retrocompatibilità e validazione aggiornata.
- **Entità collegate**: widget/entità **persone** e **luoghi** collegati agli eventi (selezione, navigazione, evidenziazione nel grafo).
- **Viste**: timeline persona, timeline globale e **vista editor timeline** dedicata per creare/modificare eventi e collegamenti.
- **UI**: widget a comparsa (apri/chiudi) ed espandibile (compatta/dettagliata) con rappresentazione temporale leggibile (asse/scala o raggruppamento cronologico).
- Nessun dato hardcoded.

## 6. Rischi e mitigazioni
- **Complessità editor/grafo:** alto. Mitigare con spike Svelte Flow e porting incrementale.
- **Parità feature:** possibile gap iniziale. Mitigare con checklist parità e rilascio per fasi.
- **CORS endpoint LLM:** non risolvibile lato client puro. Mitigare con UX chiara e documentazione (proxy opzionale fuori scope GH Pages).
- **Merge incrementale:** rischio incoerenze. Mitigare con regole deterministiche e validazione progetto.
- **Compatibilità dati:** migrare schema con attenzione a versioning/validazione.

## 7. Test e validazione
- Riuso/adattamento `tests/genogram/*` per logica modello/generazione/validazione.
- Test manuali: editor, persistenza, import/export, AI chat/config, timeline.
- Build Astro static e verifica deploy locale/GH Pages.
