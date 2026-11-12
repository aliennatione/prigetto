<script lang="ts">
  import {
    SvelteFlow,
    Controls,
    Background,
    MiniMap,
    MarkerType,
    type Node,
    type Edge,
  } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import { createId, getRelationshipConnectionError, type Project, type RelationshipType } from '../lib/genogram/model';
  import { projectToFlowNodes, projectToFlowEdges } from '../lib/genogram/flow-adapter';
  import JunctionNode from './JunctionNode.svelte';
  import FamilyEdge from './FamilyEdge.svelte';
  import PersonNode from './PersonNode.svelte';

  export let project: Project;
  export let onApply: (p: Project) => void = () => {};

  let selectedNodeId: string | null = null;
  let selectedEdgeId: string | null = null;
  let newName = '';
  let relType: RelationshipType = 'biological-parent';
  let connectFrom = '';
  let connectTo = '';

  const nodeTypes = { junction: JunctionNode, person: PersonNode } as any;
  const edgeTypes = { family: FamilyEdge } as any;

  const REL_TYPES: RelationshipType[] = ['biological-parent','adoptive-parent','step-parent','foster-parent','biological-child','adoptive-child','step-child','foster-child','partner-marriage','partner-cohabitation','partner-relationship','sibling-full','sibling-half','sibling-step','twin-fraternal','twin-identical'];

  function toGraph(p: Project): { nodes: Node[]; edges: Edge[] } {
    try {
      const rawNodes = projectToFlowNodes(p, selectedNodeId ? [selectedNodeId] : [], [], []) as any[];
      const personNodes: Node[] = rawNodes
        .filter((n) => n.type === 'person')
        .map((n) => ({
          id: n.id,
          type: 'person',
          position: n.position,
          data: { person: n.data?.person },
          selected: n.id === selectedNodeId,
          draggable: true,
        }));
      const junctionNodes: Node[] = rawNodes
        .filter((n) => n.type === 'junction')
        .map((n) => ({ id: n.id, type: 'junction', position: n.position, data: n.data || {}, draggable: false, selectable: false }));
      const graphNodes = [...personNodes, ...junctionNodes];

      const rawEdges = projectToFlowEdges(p, selectedEdgeId ? [selectedEdgeId] : [], null) as any[];
      const nodeIds = new Set(graphNodes.map(n=>n.id));
      const graphEdges: Edge[] = rawEdges.map((e) => {
        if (e.type === 'family') {
          return { id: e.id, source: e.source, target: e.target, type: 'family', data: e.data, selected: e.id === selectedEdgeId };
        }
        return {
          id: e.id, source: e.source, target: e.target,
          label: e.data?.relationship?.type || '',
          type: 'default', selected: e.id === selectedEdgeId,
          markerEnd: e.type === 'relationship' ? { type: MarkerType.ArrowClosed } : undefined,
        };
      }).filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
      return { nodes: graphNodes, edges: graphEdges };
    } catch {
      const nodes = p.people.map((person, i) => ({ id: person.id, type:'person', position: p.canvas?.positions?.[person.id] ?? { x: 120 + (i % 4) * 220, y: 120 + Math.floor(i / 4) * 160 }, data: { person }, selected: person.id===selectedNodeId }));
      const edges = p.relationships.map((r) => ({ id: r.id, source: r.source, target: r.target, label: r.type, selected: r.id===selectedEdgeId }));
      return { nodes, edges };
    }
  }

  let nodes: Node[] = [];
  let edges: Edge[] = [];

  $: {
    const g = toGraph(project);
    nodes = g.nodes;
    edges = g.edges;
  }
  $: selectedPerson = project.people.find(p=>p.id===selectedNodeId) || null;
  $: if(!connectFrom && project.people[0]) connectFrom = project.people[0].id;
  $: if(!connectTo && project.people[1]) connectTo = project.people[1].id;

  function commit(next: Project){ project = { ...next, updatedAt: new Date().toISOString() }; onApply(project); }

  function onNodeDragStop(event: any) {
    const n = event?.detail?.targetNode ?? event?.detail?.node;
    if (!n?.id || !n?.position) return;
    if (n.type === 'junction') return;
    const positions = { ...(project.canvas?.positions || {}), [n.id]: { x: n.position.x, y: n.position.y } };
    commit({ ...project, canvas: { ...(project.canvas || { viewport: { x: 0, y: 0, zoom: 1 } }), positions } });
  }
  function onNodeClick(event:any){ const id = event?.detail?.node?.id; if(event?.detail?.node?.type==='junction') return; selectedNodeId = id ?? null; selectedEdgeId = null; }
  function onEdgeClick(event:any){ selectedEdgeId = event?.detail?.edge?.id ?? null; selectedNodeId = null; }
  function onPaneClick(){ selectedNodeId = null; selectedEdgeId = null; }

  function addPerson(){
    const name = newName.trim() || 'Nuova persona';
    const id = createId('person');
    const idx = project.people.length;
    const pos = { x: 120 + (idx % 4) * 220, y: 120 + Math.floor(idx / 4) * 160 };
    const person = { id, name, gender: 'unknown', birthYear: null, deathYear: null, notes: '', timelineEvents: [], deceased: false, symbolKind: 'person', isIndexPerson: project.people.length===0, medicalMarkers: [], profile: {} } as any;
    commit({ ...project, people: [...project.people, person], canvas: { ...(project.canvas||{viewport:{x:0,y:0,zoom:1}}), positions: { ...(project.canvas?.positions||{}), [id]: pos } } });
    newName='';
  }
  function updateSelected(patch: any){
    if(!selectedNodeId) return;
    commit({ ...project, people: project.people.map(p=> p.id===selectedNodeId ? {...p, ...patch} : p) });
  }
  function deleteSelected(){
    if(selectedNodeId){
      const people = project.people.filter(p=>p.id!==selectedNodeId);
      const relationships = project.relationships.filter(r=>r.source!==selectedNodeId && r.target!==selectedNodeId);
      const positions = { ...(project.canvas?.positions||{}) }; delete positions[selectedNodeId];
      commit({ ...project, people, relationships, canvas: { ...(project.canvas||{viewport:{x:0,y:0,zoom:1}}), positions } });
      selectedNodeId=null;
    } else if(selectedEdgeId){
      commit({ ...project, relationships: project.relationships.filter(r=>r.id!==selectedEdgeId) });
      selectedEdgeId=null;
    }
  }
  function addRelationship(){
    if(!connectFrom || !connectTo) return;
    const err = getRelationshipConnectionError(project, relType, connectFrom, connectTo);
    if(err){ alert(err); return; }
    const rel = { id: createId('rel'), type: relType, source: connectFrom, target: connectTo, attributes: {} } as any;
    commit({ ...project, relationships: [...project.relationships, rel] });
  }
</script>

<div class="editor-wrap">
  <div class="toolbar">
    <input placeholder="Nome persona" bind:value={newName} />
    <button on:click={addPerson}>Aggiungi persona</button>
    <select bind:value={connectFrom}>{#each project.people as p}<option value={p.id}>{p.name||p.id}</option>{/each}</select>
    <select bind:value={relType}>{#each REL_TYPES as t}<option value={t}>{t}</option>{/each}</select>
    <select bind:value={connectTo}>{#each project.people as p}<option value={p.id}>{p.name||p.id}</option>{/each}</select>
    <button on:click={addRelationship} disabled={project.people.length<2}>Collega</button>
    <button on:click={deleteSelected} disabled={!selectedNodeId && !selectedEdgeId}>Elimina selezionato</button>
  </div>
  {#if selectedPerson}
    <div class="inspector">
      <strong>Persona selezionata</strong>
      <label>Nome <input value={selectedPerson.name} on:input={(e)=>updateSelected({name:(e.target as HTMLInputElement).value})} /></label>
      <label>Genere
        <select value={selectedPerson.gender} on:change={(e)=>updateSelected({gender:(e.target as HTMLSelectElement).value})}>
          <option value="male">Maschio</option><option value="female">Femmina</option><option value="unknown">Sconosciuto</option><option value="other">Altro</option>
        </select>
      </label>
      <label><input type="checkbox" checked={selectedPerson.deceased} on:change={(e)=>updateSelected({deceased:(e.target as HTMLInputElement).checked})} /> Deceduto/a</label>
    </div>
  {/if}
  <div class="hint">Editor (3.2, in miglioramento): nodi persona custom, junction/family edge semplificati da flow-adapter. Parità visiva/funzionale completa con l'originale in corso.</div>
  <div class="flow">
    <SvelteFlow bind:nodes bind:edges {nodeTypes} {edgeTypes} fitView on:nodedragstop={onNodeDragStop} on:nodeclick={onNodeClick} on:edgeclick={onEdgeClick} on:paneclick={onPaneClick}>
      <Controls />
      <Background />
      <MiniMap />
    </SvelteFlow>
  </div>
</div>

<style>
  .editor-wrap{display:flex;flex-direction:column;gap:6px;height:620px}
  .toolbar,.inspector{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
  .toolbar input,.toolbar select{max-width:180px}
  .inspector{padding:8px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa}
  .inspector label{display:flex;gap:6px;align-items:center;font-size:.9em}
  .flow{flex:1;min-height:420px;border:1px solid #ddd;border-radius:8px;overflow:hidden;background:#fff}
  .hint{font-size:.85em;color:#555}
</style>
