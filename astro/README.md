# Prigetto — Astro migration

Build statico Astro + Svelte islands per Genogram Canvas.

## Comandi
- `npm install`
- `npm run dev`
- `npm run build` → output `dist/`

## Deploy GitHub Pages
- Output statico: `dist/`
- Impostare `BASE_PATH` (es. `/<repo>`) in build se servito da sottopath.
- Nota: app client-side con IndexedDB; chiamate AI sono **API dirette** dal browser.

## AI (preferenza: API dirette)
- Configurazione in UI: Base URL, API key, preset (OpenAI/Groq/Together/Ollama/OpenCodeGo/Custom), modello con fetch `/models`.
- Limiti: su GitHub Pages endpoint privati/VPN possono non essere raggiungibili e richiedono CORS abilitato lato server. In tali casi usare endpoint pubblico o fallback MCP (separato).

## Timeline
- Eventi estesi con `linkedPersonIds`, `linkedPlaceIds`, luogo/tipo/date; gestione luoghi (`Project.places`).
- Viste: globale, per persona, editor timeline (widget persone/luoghi).
