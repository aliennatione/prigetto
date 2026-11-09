# Prigetto — Genogramma e Timeline

Applicazione web (Astro + Svelte) per creare **genogrammi** e una **timeline per ogni nodo** (persona), con salvataggio locale (IndexedDB) ed esportazione/importazione in JSON per il riutilizzo dei dati.

## Stack (open source)

- Genogramma: [`@famtree/schema`](https://www.npmjs.com/package/@famtree/schema), [`@famtree/core`](https://www.npmjs.com/package/@famtree/core), [`@famtree/renderer`](https://www.npmjs.com/package/@famtree/renderer)
- Timeline: [`vis-timeline`](https://www.npmjs.com/package/vis-timeline) + `vis-data`
- UI: Astro + Svelte + Tailwind CSS
- Persistenza: Dexie (IndexedDB) + export/import JSON

## Avvio

```bash
npm install
npm run dev      # sviluppo
npm run build    # build statica in dist/
npm run preview  # anteprima build
```

## Riutilizzo dei dati

I progetti sono salvati in IndexedDB nel browser e possono essere esportati come JSON (`Esporta JSON`). Il formato è un superset del documento `@famtree/schema`:

```json
{
  "id": "...",
  "name": "Famiglia Rossi",
  "createdAt": "...",
  "updatedAt": "...",
  "genogram": { "version": "1.0.0", "people": [...], "relationships": [...] },
  "timelines": { "<personId>": [ { "id": "...", "start": "2020-01-01", "content": "..." } ] }
}
```

È possibile importare un genogramma puro `@famtree/schema` (verrà avvolto in un progetto) oppure un progetto completo. Export SVG disponibile per il genogramma.

## Funzionalità

- Gestione persone (nome, sesso, nascita/morte, proband, note)
- Relazioni: unioni, figli, legami emotivi
- Genogramma SVG interattivo (click sul nodo per selezionare)
- Timeline per persona selezionata con eventi tipizzati
- Auto-save in IndexedDB
