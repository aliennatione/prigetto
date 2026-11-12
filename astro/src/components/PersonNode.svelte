<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';
  export let data: any = {};
  export let selected: boolean = false;
  $: person = data?.person || {};
  $: name = person.name || '(senza nome)';
  $: gender = person.gender || 'unknown';
  $: deceased = !!person.deceased;
  $: shape = gender === 'male' ? 'square' : gender === 'female' ? 'circle' : 'diamond';
</script>

<div class="person" class:selected class:deceased>
  <Handle type="target" position={Position.Top} id="top-target" />
  <div class="symbol {shape}">{name.slice(0,2).toUpperCase()}</div>
  <div class="name">{name}</div>
  {#if person.birthYear || person.deathYear}<div class="years">{person.birthYear ?? '?'}–{person.deathYear ?? (deceased ? '?' : '')}</div>{/if}
  <Handle type="source" position={Position.Bottom} id="bottom-source" />
</div>

<style>
  .person{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:90px;cursor:pointer}
  .symbol{width:42px;height:42px;display:flex;align-items:center;justify-content:center;border:2px solid #1f2937;background:#fff;font-size:11px;font-weight:700}
  .symbol.circle{border-radius:999px}
  .symbol.diamond{transform:rotate(45deg);border-radius:4px}
  .symbol.diamond{font-size:10px}
  .person.selected .symbol{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.2)}
  .person.deceased .symbol{background:linear-gradient(to bottom right, transparent 48%, #1f2937 48%, #1f2937 52%, transparent 52%), #fff}
  .name{font-size:12px;text-align:center;max-width:120px;line-height:1.2}
  .years{font-size:10px;color:#555}
</style>
