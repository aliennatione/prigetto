<script lang="ts">
  import ProjectList from './ProjectList.svelte';
  import Editor from './Editor.svelte';
  import { currentProject } from '../lib/store';

  let project = $state<any>(null);
  $effect(() => {
    const unsub = currentProject.subscribe((p) => (project = p));
    return unsub;
  });
</script>

{#if project}
  <Editor />
{:else}
  <ProjectList />
{/if}
