<script lang="ts">
  import MarkmapView from './MarkmapView.svelte';
  import { upsertPerson, removePerson } from '../lib/genogram';
  import type { Person, Genogram } from '@famtree/schema';

  let { doc = $bindable(), selectedId = $bindable(null) }: { doc: Genogram; selectedId: string | null } = $props();

  let showForm = $state(false);
  let editing: Person | null = $state(null);
  let showMarkmap = $state(false);

  const sexes = ['male', 'female', 'unknown'] as const;
  const newPerson = (): Person => ({
    id: crypto.randomUUID(),
    name: '',
    sex: 'unknown',
  });

  function startAdd() { editing = newPerson(); showForm = true; }
  function startEdit(p: Person) { editing = { ...p }; showForm = true; }
  function cancel() { editing = null; showForm = false; }
  function save() {
    if (!editing || !editing.name.trim()) { alert('Nome richiesto'); return; }
    upsertPerson(doc, editing);
    selectedId = editing.id;
    doc = doc; // trigger reactivity? doc is prop; mutate in place. Parent may not update. We'll rely on mutation + tick.
    cancel();
  }
  function remove(id: string) {
    if (!confirm('Eliminare questa persona e le sue relazioni?')) return;
    removePerson(doc, id);
    if (selectedId === id) selectedId = null;
    doc = doc;
  }
</script>

<div class="space-y-3">
  <div class="flex items-center justify-between">
    <h2 class="font-semibold">Persone ({doc.people.length})</h2>
    <button class="px-2 py-1 text-sm bg-indigo-600 text-white rounded" on:click={startAdd}>+ Aggiungi</button>
  </div>

  {#if showForm && editing}
    <div class="border rounded p-3 bg-gray-50 space-y-2">
      <input class="w-full border rounded px-2 py-1" placeholder="Nome" bind:value={editing.name} />
      <select class="w-full border rounded px-2 py-1" bind:value={editing.sex}>
        {#each sexes as s}<option value={s}>{s}</option>{/each}
      </select>
      <div class="grid grid-cols-2 gap-2">
        <input class="border rounded px-2 py-1" type="date" placeholder="Nascita" bind:value={editing.birthDate} />
        <input class="border rounded px-2 py-1" type="date" placeholder="Morte" bind:value={editing.deathDate} />
      </div>
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" bind:checked={editing.deceased} /> Deceduto/a
      </label>
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" bind:checked={editing.isProband} /> Proband (freccia)
      </label>
      <input class="w-full border rounded px-2 py-1" placeholder="Note (markdown)" bind:value={editing.notes} />
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" bind:checked={showMarkmap} /> Anteprima note come mappa (markmap)
      </label>
      {#if showMarkmap}
        <MarkmapView markdown={editing.notes || ''} />
      {/if}
      <div class="flex gap-2">
        <button class="px-2 py-1 bg-indigo-600 text-white rounded text-sm" on:click={save}>Salva</button>
        <button class="px-2 py-1 border rounded text-sm" on:click={cancel}>Annulla</button>
      </div>
    </div>
  {/if}

  <ul class="space-y-1 max-h-[40vh] overflow-auto">
    {#each doc.people as p (p.id)}
      <li class="flex items-center justify-between border rounded px-2 py-1 {selectedId === p.id ? 'bg-indigo-50 border-indigo-300' : ''}">
        <button class="text-left flex-1" on:click={() => (selectedId = p.id)}>
          <span class="font-medium">{p.name || '(senza nome)'}</span>
          <span class="text-xs text-gray-500 ml-1">{p.sex}</span>
        </button>
        <div class="flex gap-1">
          <button class="text-xs px-1" on:click={() => startEdit(p)}>✎</button>
          <button class="text-xs px-1 text-red-600" on:click={() => remove(p.id)}>✕</button>
        </div>
      </li>
    {/each}
  </ul>
</div>
