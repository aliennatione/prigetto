<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Timeline } from 'vis-timeline/standalone';
  import { DataSet } from 'vis-data';
  import type { TimelineEvent, Person } from '../lib/types';

  let { person, events = [], onUpdate = (_ev: TimelineEvent[]) => {} }: { person: Person | null; events: TimelineEvent[]; onUpdate?: (ev: TimelineEvent[]) => void } = $props();
  let localEvents = $state<TimelineEvent[]>(events);
  $effect(() => { localEvents = events; });

  let container: HTMLDivElement;
  let timeline: Timeline | null = null;
  let items: DataSet<any> | null = null;

  // form
  let content = $state('');
  let start = $state('');
  let end = $state('');
  let type = $state<TimelineEvent['type']>('event');

  function mapItems(ev: TimelineEvent[]) {
    return ev.map((e) => ({
      id: e.id,
      content: e.content,
      start: e.start,
      end: e.end,
      type: e.end ? 'range' : 'box',
      className: `tl-${e.type || 'event'}`,
    }));
  }

  onMount(() => {
    items = new DataSet(mapItems(localEvents));
    timeline = new Timeline(container, items, {
      height: '260px',
      zoomMin: 1000 * 60 * 60 * 24 * 7,
      editable: false,
      orientation: 'top',
      stack: true,
    });
  });

  $effect(() => {
    if (items && timeline) {
      items.clear();
      items.add(mapItems(localEvents));
    }
  });

  onDestroy(() => {
    timeline?.destroy();
    timeline = null;
  });

  function addEvent() {
    if (!person || !content.trim() || !start) { alert('Contenuto e data inizio richiesti'); return; }
    const ev: TimelineEvent = {
      id: crypto.randomUUID(),
      personId: person.id,
      content: content.trim(),
      start,
      end: end || undefined,
      type,
    };
    localEvents = [...localEvents, ev];
    onUpdate(localEvents);
    content = ''; start = ''; end = ''; type = 'event';
  }

  function removeEvent(id: string) {
    localEvents = localEvents.filter((e) => e.id !== id);
    onUpdate(localEvents);
  }
</script>

<div class="space-y-3">
  <h2 class="font-semibold">Timeline — {person?.name ?? ''}</h2>
  {#if !person}
    <p class="text-sm text-gray-500">Seleziona una persona per vedere la sua timeline.</p>
  {:else}
    <div bind:this={container} class="border rounded bg-white"></div>

    <div class="border rounded p-2 space-y-2">
      <div class="text-sm font-medium">Nuovo evento</div>
      <input class="w-full border rounded px-2 py-1 text-sm" placeholder="Descrizione evento" bind:value={content} />
      <div class="grid grid-cols-3 gap-2">
        <input class="border rounded px-2 py-1 text-sm" type="date" bind:value={start} />
        <input class="border rounded px-2 py-1 text-sm" type="date" bind:value={end} />
        <select class="border rounded px-2 py-1 text-sm" bind:value={type}>
          {#each ['birth','death','marriage','illness','milestone','event'] as t}<option value={t}>{t}</option>{/each}
        </select>
      </div>
      <button class="px-2 py-1 bg-indigo-600 text-white rounded text-sm" on:click={addEvent}>Aggiungi evento</button>
    </div>

    <ul class="text-xs space-y-1 max-h-32 overflow-auto">
      {#each localEvents as e (e.id)}
        <li class="flex justify-between border rounded px-2 py-1">
          <span>{e.start}{e.end ? ' → ' + e.end : ''}: {e.content} ({e.type})</span>
          <button class="text-red-600" on:click={() => removeEvent(e.id)}>✕</button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  :global(.tl-birth) { background: #dcfce7; }
  :global(.tl-death) { background: #e5e7eb; }
  :global(.tl-marriage) { background: #fce7f3; }
  :global(.tl-illness) { background: #fee2e2; }
  :global(.tl-milestone) { background: #dbeafe; }
</style>
