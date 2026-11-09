<script lang="ts">
  import { addUnion, addChild, addEmotional } from '../lib/genogram';
  import type { Genogram } from '@famtree/schema';

  let { doc = $bindable(), selectedId = $bindable(null) }: { doc: Genogram; selectedId: string | null } = $props();

  let partnerId = $state('');
  let unionType = $state('married');
  let childId = $state('');
  let unionIdForChild = $state('');
  let emotionalTarget = $state('');
  let emotionalBond = $state('close');

  const selected = $derived(doc.people.find((p) => p.id === selectedId));
  const others = $derived(doc.people.filter((p) => p.id !== selectedId));
  const unions = $derived(doc.relationships.filter((r: any) => r.type === 'union'));

  function newUnion() {
    if (!selectedId || !partnerId) return;
    addUnion(doc, [selectedId, partnerId], unionType, 'current');
    doc = doc;
    partnerId = '';
  }

  function newChild() {
    if (!childId || !unionIdForChild) return;
    addChild(doc, childId, { unionId: unionIdForChild });
    doc = doc;
    childId = '';
  }

  function newEmotional() {
    if (!selectedId || !emotionalTarget) return;
    addEmotional(doc, selectedId, emotionalTarget, emotionalBond);
    doc = doc;
    emotionalTarget = '';
  }

  function removeRel(id: string) {
    doc.relationships = doc.relationships.filter((r: any) => r.id !== id);
    doc = doc;
  }
</script>

<div class="space-y-4">
  <h2 class="font-semibold">Relazioni</h2>
  {#if !selected}
    <p class="text-sm text-gray-500">Seleziona una persona per gestire le relazioni.</p>
  {:else}
    <div class="text-sm text-gray-600">Persona selezionata: <b>{selected.name}</b></div>

    <!-- Union -->
    <div class="border rounded p-2 space-y-2">
      <div class="text-sm font-medium">Nuova unione (partner)</div>
      <select class="w-full border rounded px-2 py-1 text-sm" bind:value={partnerId}>
        <option value="">-- scegli partner --</option>
        {#each others as p}<option value={p.id}>{p.name}</option>{/each}
      </select>
      <select class="w-full border rounded px-2 py-1 text-sm" bind:value={unionType}>
        {#each ['married','engaged','cohabiting','committed','casual','unknown'] as u}<option value={u}>{u}</option>{/each}
      </select>
      <button class="px-2 py-1 bg-indigo-600 text-white rounded text-sm" on:click={newUnion} disabled={!partnerId}>Crea unione</button>
    </div>

    <!-- Child to union -->
    <div class="border rounded p-2 space-y-2">
      <div class="text-sm font-medium">Aggiungi figlio/a a un'unione</div>
      <select class="w-full border rounded px-2 py-1 text-sm" bind:value={childId}>
        <option value="">-- scegli figlio --</option>
        {#each doc.people as p}<option value={p.id}>{p.name}</option>{/each}
      </select>
      <select class="w-full border rounded px-2 py-1 text-sm" bind:value={unionIdForChild}>
        <option value="">-- scegli unione --</option>
        {#each unions as u (u.id)}
          <option value={u.id}>{(u as any).partnerIds.map((id: string) => doc.people.find((p) => p.id === id)?.name).join(' & ')}</option>
        {/each}
      </select>
      <button class="px-2 py-1 bg-indigo-600 text-white rounded text-sm" on:click={newChild} disabled={!childId || !unionIdForChild}>Aggiungi</button>
    </div>

    <!-- Emotional -->
    <div class="border rounded p-2 space-y-2">
      <div class="text-sm font-medium">Legame emotivo</div>
      <select class="w-full border rounded px-2 py-1 text-sm" bind:value={emotionalTarget}>
        <option value="">-- scegli persona --</option>
        {#each others as p}<option value={p.id}>{p.name}</option>{/each}
      </select>
      <select class="w-full border rounded px-2 py-1 text-sm" bind:value={emotionalBond}>
        {#each ['close','very-close','fused','distant','estranged','cutoff','hostile','conflict','friendship','love','focused-on'] as b}<option value={b}>{b}</option>{/each}
      </select>
      <button class="px-2 py-1 bg-indigo-600 text-white rounded text-sm" on:click={newEmotional} disabled={!emotionalTarget}>Aggiungi legame</button>
    </div>

    <!-- List -->
    <div class="border rounded p-2">
      <div class="text-sm font-medium mb-1">Relazioni esistenti</div>
      <ul class="text-xs space-y-1 max-h-40 overflow-auto">
        {#each doc.relationships as r (r.id)}
          <li class="flex justify-between items-center">
            <span>
              {#if r.type === 'union'}
                Unione: {(r as any).partnerIds.map((id: string) => doc.people.find((p) => p.id === id)?.name).join(' & ')} ({(r as any).unionType}, {(r as any).status})
              {:else if r.type === 'parent-child'}
                Figlio: {doc.people.find((p) => p.id === (r as any).childId)?.name}
              {:else if r.type === 'emotional'}
                Emotivo: {(r as any).personIds.map((id: string) => doc.people.find((p) => p.id === id)?.name).join(' ↔ ')} ({(r as any).bond})
              {/if}
            </span>
            <button class="text-red-600" on:click={() => removeRel(r.id)}>✕</button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
