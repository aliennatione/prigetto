<script lang="ts">
  import { onMount } from 'svelte';
  import AiTherapistPanel from './AiTherapistPanel.svelte';
  import TimelinePanel from './TimelinePanel.svelte';
  import GenogramEditor from './GenogramEditor.svelte';
  import { createEmptyProject, validateProject, type Project } from '../lib/genogram/model';
  import { listLocalProjects, loadLocalProject, saveLocalProject, importLocalProject } from '../lib/genogram/local-persistence';

  let project: Project = createEmptyProject('Progetto');
  let projects: any[] = [];
  let status = '';
  let selectedId = '';

  async function refresh(){ try { projects = await listLocalProjects(); } catch(e:any){ status = 'Persistenza non disponibile: '+(e?.message||e); } }
  onMount(async () => { await refresh(); if(projects[0]){ selectedId = projects[0].id; await load(selectedId); } else { await save(); await refresh(); } });
  async function load(id:string){ const p = await loadLocalProject(id); if(p){ project = validateProject(p); selectedId = p.id; status='Caricato'; } }
  async function save(){ project = {...project, updatedAt: new Date().toISOString()}; await saveLocalProject(project); status='Salvato'; await refresh(); }
  async function newProject(){ project = createEmptyProject('Nuovo genogramma'); selectedId = project.id; await save(); }
  function apply(p:Project){ project = validateProject(p as any); save(); }
  async function doImport(ev: Event){
    const file = (ev.target as HTMLInputElement).files?.[0]; if(!file) return;
    const text = await file.text();
    try{ const imported = await importLocalProject(validateProject(JSON.parse(text))); project = imported; selectedId = imported.id; await refresh(); status='Importato'; }catch(e:any){ status='Import fallito: '+(e?.message||e); }
  }
  function doExport(){
    const blob = new Blob([JSON.stringify(project,null,2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (project.name||'genogram')+'.json'; a.click(); URL.revokeObjectURL(a.href);
  }
</script>

<div class="wrap">
  <header>
    <strong>Editor (migrazione Astro)</strong>
    <select bind:value={selectedId} on:change={() => load(selectedId)}>
      {#each projects as p}<option value={p.id}>{p.name}</option>{/each}
    </select>
    <button on:click={newProject}>Nuovo</button>
    <button on:click={save}>Salva</button>
    <button on:click={doExport}>Export JSON</button>
    <label class="imp">Import JSON <input type="file" accept="application/json" on:change={doImport} /></label>
    <span class="status">{status}</span>
  </header>
  <div class="grid">
    <section class="main">
      <GenogramEditor {project} onApply={apply} />
      <div class="people"><small>Persone: {project.people.length} · Relazioni: {project.relationships.length}</small></div>
    </section>
    <aside>
      <AiTherapistPanel {project} onApply={apply} />
      <TimelinePanel {project} onApply={apply} />
    </aside>
  </div>
</div>

<style>
  .wrap{padding:12px;font-family:system-ui,sans-serif}
  header{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
  .grid{display:grid;grid-template-columns:1.4fr 1fr;gap:12px}
  .main{border:1px solid #ddd;border-radius:8px;padding:12px;background:#fff}
  aside{display:flex;flex-direction:column;gap:8px}
  .status{color:#555;font-size:.9em}
  .imp input{display:none}.imp{cursor:pointer;border:1px solid #ccc;padding:4px 8px;border-radius:6px;background:#f8f8f8}
  @media(max-width:1000px){.grid{grid-template-columns:1fr}}
</style>
