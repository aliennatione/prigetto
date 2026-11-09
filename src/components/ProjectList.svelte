<script lang="ts">
  import { onMount } from 'svelte';
  import { listProjects, deleteProject, saveProject } from '../lib/db';
  import { newProject } from '../lib/types';
  import { parseProjectJson } from '../lib/genogram';
  import { exportProjectJson } from '../lib/genogram';
  import { currentProject } from '../lib/store';

  let projects: any[] = [];
  let loading = true;

  async function refresh() {
    projects = await listProjects();
    loading = false;
  }

  onMount(refresh);

  async function create() {
    const name = prompt('Nome del nuovo progetto?') || 'Nuovo progetto';
    const p = newProject(name);
    await saveProject(p);
    currentProject.set(p);
    await refresh();
  }

  async function open(p: any) {
    const full = await (await import('../lib/db')).getProject(p.id);
    if (full) currentProject.set(full);
  }

  async function remove(p: any) {
    if (!confirm(`Eliminare il progetto "${p.name}"?`)) return;
    await deleteProject(p.id);
    await refresh();
  }

  function download(p: any) {
    // need full project
    (async () => {
      const full = await (await import('../lib/db')).getProject(p.id);
      if (!full) return;
      const blob = new Blob([exportProjectJson(full)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${full.name}.json`;
      a.click();
      URL.revokeObjectURL(url);
    })();
  }

  function importFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const project = parseProjectJson(String(reader.result));
        await saveProject(project);
        currentProject.set(project);
        await refresh();
      } catch (err) {
        alert('File non valido: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    input.value = '';
  }
</script>

<div class="max-w-4xl mx-auto p-6">
  <header class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Prigetto</h1>
      <p class="text-sm text-gray-600">Genogrammi e timeline per ogni nodo — dati salvati in IndexedDB, esportabili in JSON.</p>
    </div>
    <div class="flex gap-2">
      <label class="px-3 py-2 bg-white border rounded cursor-pointer hover:bg-gray-50">
        Importa JSON
        <input type="file" accept="application/json,.json" class="hidden" on:change={importFile} />
      </label>
      <button class="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" on:click={create}>+ Nuovo progetto</button>
    </div>
  </header>

  {#if loading}
    <p>Caricamento...</p>
  {:else if projects.length === 0}
    <div class="text-center py-12 border-2 border-dashed rounded">
      <p class="text-gray-500">Nessun progetto. Creane uno nuovo o importa un JSON.</p>
    </div>
  {:else}
    <ul class="grid gap-3">
      {#each projects as p (p.id)}
        <li class="bg-white border rounded p-4 flex items-center justify-between">
          <div>
            <div class="font-semibold">{p.name}</div>
            <div class="text-xs text-gray-500">Aggiornato: {new Date(p.updatedAt).toLocaleString()}</div>
          </div>
          <div class="flex gap-2">
            <button class="px-2 py-1 text-sm bg-indigo-600 text-white rounded" on:click={() => open(p)}>Apri</button>
            <button class="px-2 py-1 text-sm border rounded" on:click={() => download(p)}>Esporta</button>
            <button class="px-2 py-1 text-sm text-red-600 border rounded" on:click={() => remove(p)}>Elimina</button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
