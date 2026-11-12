'use client';

import { useMemo, useState } from 'react';
import { useGenogramStore } from '../lib/genogram/store';

export default function PersonTimelinePanel() {
  const project = useGenogramStore((s) => s.project);
  const [open, setOpen] = useState(true);

  const events = useMemo(() => {
    const items: { id: string; date: string; title: string; person: string; description?: string }[] = [];
    project.people.forEach((p) => {
      if (p.birthYear != null) items.push({ id: `${p.id}-birth`, date: String(p.birthYear), title: 'Nascita', person: p.name });
      (p.timelineEvents ?? []).forEach((e) => items.push({ id: e.id, date: e.date, title: e.title, person: p.name, description: e.description }));
      if (p.deceased && p.deathYear != null) items.push({ id: `${p.id}-death`, date: String(p.deathYear), title: 'Decesso', person: p.name });
    });
    return items.sort((a, b) => a.date.localeCompare(b.date));
  }, [project]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ position: 'fixed', left: 16, bottom: 16, zIndex: 1000, padding: '8px 12px', borderRadius: 999, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
      >
        Timeline progetto
      </button>
    );
  }

  return (
    <div style={{ position: 'fixed', left: 16, bottom: 16, width: 360, maxHeight: 420, zIndex: 1000, background: '#fff', border: '1px solid #ddd', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 10, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Timeline del progetto</strong>
        <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>×</button>
      </div>
      <div style={{ padding: 10, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.length === 0 && <div style={{ color: '#666' }}>Nessun evento.</div>}
        {events.map((e) => (
          <div key={e.id} style={{ borderLeft: '3px solid #2563eb', paddingLeft: 8 }}>
            <div style={{ fontWeight: 600 }}>{e.date} — {e.person}</div>
            <div>{e.title}</div>
            {e.description && <div style={{ fontSize: 12, color: '#555' }}>{e.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}