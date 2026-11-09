<script lang="ts">
  import { currentProject } from '../lib/store';
  import { saveProject, deleteProject } from '../lib/db';
  import { exportProjectJson, parseProjectJson } from '../lib/genogram';
  import PeopleSidebar from './PeopleSidebar.svelte';
  import RelationshipsPanel from './RelationshipsPanel.svelte';
  import GenogramView from './GenogramView.svelte';
  import TimelinePanel from './TimelinePanel.svelte';
  import MarkmapView from './MarkmapView.svelte';

  let project = $state<any>(null);
  let selectedId = $state<string | null>(null);
  let showProjectMap = $state(false);
  let saveStatus = $state('idle');
  let saveTimer: any;

  // sync from store
  $effect(() => {
    const unsub = currentProject.subscribe((p) => {
      project = p;
      if (p && !selectedId && p.genogram.people.length) selectedId = p.genogram.people[0].id;
    });
    return unsub;
  });

  // auto-save on mutation (rough: track project reference changes)
  $effect(() => {
    if (!project) return;
    // touch to track
    const snapshot = JSON.stringify(project);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        await saveProject(project);
        saveStatus = 'saved ' + new Date().toLocaleTimeString();
      } catch (e) {
        saveStatus = 'error';
      }
    }, 900);
  });

  const selectedPerson = $derived(project?.genogram.people.find((p: any) => p.id === selectedId) ?? null);
  const selectedEvents = $derived(project?.timelines?.[selectedId ?? ''] ?? []);

  function setEvents(ev: any[]) {
    if (!project || !selectedId) return;
    if (!project.timelines) project.timelines = {};
    project.timelines[selectedId] = ev;
    project = project;
    currentProject.set(project);
  }

  function back() {
    currentProject.set(null);
  }

  function exportJson() {
    if (!project) return;
    const blob = new Blob([exportProjectJson(project)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportSvg() {
    if (!project) return;
    const { renderGenogram } = await import('@famtree/renderer');
    const { svg } = renderGenogram(project.genogram);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const p = parseProjectJson(String(reader.result));
        await saveProject(p);
        currentProject.set(p);
      } catch (err) {
        alert('File non valido');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  async function removeProject() {
    if (!project || !confirm('Eliminare il progetto corrente?')) return;
    await deleteProject(project.id);
    currentProject.set(null);
  }

  function onGenogramSelect(id: string) {
    selectedId = id;
  }
</script>

{#if !project}
  <div class="p-6 text-gray-500">Nessun progetto aperto.</div>
{:else}
  <div class="h-screen flex flex-col">
    <header class="border-b bg-white px-4 py-2 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="px-2 py-1 border rounded text-sm" on:click={back}>← Progetti</button>
        <input class="font-semibold text-lg border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none" bind:value={project.name} />
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span class="text-gray-400">{saveStatus}</span>
        <label class="px-2 py-1 border rounded cursor-pointer">
          Importa
          <input type="file" accept=".json,application/json" class="hidden" on:change={importJson} />
        </label>
        <button class="px-2 py-1 border rounded" on:click={exportJson}>Esporta JSON</button>
        <button class="px-2 py-1 border rounded" on:click={exportSvg}>Esporta SVG</button>
        <button class="px-2 py-1 text-red-600 border rounded" on:click={removeProject}>Elimina</button>
      </div>
    </header>

    <div class="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
      <!-- Left -->
      <aside class="col-span-3 border-r bg-white p-3 overflow-auto">
        <PeopleSidebar bind:doc={project.genogram} bind:selectedId />
      </aside>

      <!-- Center -->
      <main class="col-span-5 p-3 overflow-auto bg-gray-50">
        <GenogramView doc={project.genogram} selectedId={selectedId} onSelect={onGenogramSelect} />
      </main>

      <!-- Right -->
      <aside class="col-span-4 border-l bg-white p-3 overflow-auto space-y-4">
        <RelationshipsPanel bind:doc={project.genogram} bind:selectedId />
        <TimelinePanel person={selectedPerson} events={selectedEvents} onUpdate={setEvents} />

        <div class="border-t pt-3 space-y-2">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">Note progetto (markdown)</h2>
            <label class="text-sm flex items-center gap-1">
              <input type="checkbox" bind:checked={showProjectMap} /> Mappa
            </label>
          </div>
          <textarea class="w-full border rounded px-2 py-1 text-sm min-h-[120px]" bind:value={project.notes} placeholder="# Titolo
- punto 1
- punto 2"></textarea>
          {#if showProjectMap}
            <MarkmapView markdown={project.notes || ''} />
          {/if}
        </div>
      </aside>
    </div>
  </div>
{/if}
