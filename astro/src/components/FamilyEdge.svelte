<script lang="ts">
  import { BaseEdge } from '@xyflow/svelte';
  export let id: string;
  export let sourceX: number;
  export let sourceY: number;
  export let targetX: number;
  export let targetY: number;
  export let data: any = {};
  export let selected: boolean = false;

  function f(n:number){ return (Math.round(n*100)/100).toFixed(2); }
  function pathFromData(d:any){
    if(!d) return '';
    const originX = (d.parentLeftX != null && d.parentRightX != null) ? (d.parentLeftX + d.parentRightX)/2 + (d.originOffset||0) : sourceX;
    const parentY = d.parentLineY ?? sourceY;
    const sibY = d.siblingY ?? (parentY + 70);
    const singles = d.singles||[];
    const twins = d.twins||[];
    const all = [...singles, ...twins.flatMap((t:any)=>[t.first,t.second])].filter(Boolean);
    if(all.length===0) return `M ${f(sourceX)} ${f(sourceY)} L ${f(targetX)} ${f(targetY)}`;
    const xs = [originX, ...all.map((c:any)=>c.x)];
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    let p = `M ${f(originX)} ${f(parentY)} L ${f(originX)} ${f(sibY)} `;
    if(Math.abs(maxX-minX)>0.5) p += `M ${f(minX)} ${f(sibY)} L ${f(maxX)} ${f(sibY)} `;
    for(const c of singles){
      const y = c.y ?? targetY;
      p += `M ${f(c.x)} ${f(sibY)} L ${f(c.x)} ${f(y)} `;
    }
    for(const t of twins){
      const midX = (t.first.x + t.second.x)/2;
      const splitY = Math.min(sibY + 18, Math.min(t.first.y, t.second.y) - 12);
      p += `M ${f(midX)} ${f(sibY)} L ${f(midX)} ${f(splitY)} `;
      p += `M ${f(midX)} ${f(splitY)} L ${f(t.first.x)} ${f(t.first.y)} `;
      p += `M ${f(midX)} ${f(splitY)} L ${f(t.second.x)} ${f(t.second.y)} `;
      if(t.type === 'identical-twins'){
        const yb = splitY + (Math.min(t.first.y,t.second.y)-splitY)*0.5;
        p += `M ${f(midX + (t.first.x-midX)*0.4)} ${f(yb)} L ${f(midX + (t.second.x-midX)*0.4)} ${f(yb)} `;
      }
    }
    return p.trim();
  }
  $: edgePath = pathFromData(data) || `M ${f(sourceX)} ${f(sourceY)} L ${f(targetX)} ${f(targetY)}`;
  $: stroke = selected ? '#2563eb' : (data?.color || '#111827');
</script>

<BaseEdge {id} path={edgePath} style={`stroke:${stroke};stroke-width:${selected?2.8:2}px;stroke-linecap:round;stroke-linejoin:round;${data?.hidden?'opacity:0.15':''}`} />
