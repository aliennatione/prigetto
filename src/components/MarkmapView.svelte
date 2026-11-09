<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Transformer } from 'markmap-lib';
  import { Markmap } from '@markmap/view';

  let { markdown = '' }: { markdown: string } = $props();

  let svgEl: SVGSVGElement;
  let mm: any = null;
  const transformer = new Transformer();

  function render() {
    if (!svgEl) return;
    try {
      mm?.destroy();
    } catch {}
    mm = null;
    svgEl.innerHTML = '';
    const { root } = transformer.transform(markdown?.trim() ? markdown : '# (vuoto)');
    mm = Markmap.create(svgEl, root, { autoFit: true });
  }

  onMount(render);
  $effect(() => {
    // track markdown
    void markdown;
    render();
  });

  onDestroy(() => {
    try { mm?.destroy(); } catch {}
  });
</script>

<div class="markmap-container border rounded bg-white overflow-hidden" style="min-height:240px;">
  <svg bind:this={svgEl} class="w-full h-64"></svg>
</div>
