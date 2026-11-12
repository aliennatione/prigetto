<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';
  export let data: any;
</script>
<div class="junction" title="Family junction">
  <Handle type="source" position={Position.Bottom} id="bottom-source" />
  <Handle type="target" position={Position.Top} id="top-target" />
</div>
<style>
  .junction{width:1px;height:1px;opacity:0;pointer-events:none}
</style>
