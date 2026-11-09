<script lang="ts">
  import { render, positions, NODE_R } from '../lib/genogram';
  import type { Genogram } from '@famtree/schema';

  let { doc, selectedId = null, onSelect = (_id: string) => {} }: { doc: Genogram; selectedId?: string | null; onSelect?: (id: string) => void } = $props();

  const rendered = $derived(render(doc));
  const posInfo = $derived(positions(doc));

  function select(id: string) { onSelect(id); }
</script>

<div class="genogram-wrap">
  {#if !doc.people || doc.people.length === 0}
    <div class="text-sm text-gray-500 p-4">Aggiungi persone per visualizzare il genogramma.</div>
  {:else if rendered}
    <div class="svg-container" style={`width:${rendered.stats.width}px; max-width:100%;`}>
      {@html rendered.svg}
      <svg class="overlay" width={rendered.stats.width} height={rendered.stats.height} viewBox={`0 0 ${rendered.stats.width} ${rendered.stats.height}`}>
        {#each doc.people as p (p.id)}
          {@const pt = posInfo.pos.cx(p.id) ? { x: posInfo.pos.cx(p.id), y: posInfo.pos.cy(p.id) } : null}
          {#if pt}
            <circle
              cx={pt.x} cy={pt.y} r={NODE_R + 4}
              fill="transparent" stroke={selectedId === p.id ? '#4f46e5' : 'transparent'}
              stroke-width="3" class="hit"
              on:click={() => select(p.id)}
            />
          {/if}
        {/each}
      </svg>
    </div>
  {/if}
</div>

<style>
  .genogram-wrap { overflow: auto; }
  .svg-container { position: relative; display: inline-block; }
  .svg-container :global(svg:first-child) { display: block; }
  .overlay { position: absolute; top: 0; left: 0; pointer-events: none; }
  .overlay .hit { pointer-events: all; cursor: pointer; }
</style>
