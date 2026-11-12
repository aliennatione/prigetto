'use client';

import { useState } from 'react';
import { useGenogramStore } from '../lib/genogram/store';
import { type TimelineEventV2 } from '../lib/genogram/model';

export function EventEditor({ event }: { event: TimelineEventV2 }) {
  const updateEvent = useGenogramStore((s) => s.updateEvent);
  const deleteEvent = useGenogramStore((s) => s.deleteEvent);
  const addEventRelation = useGenogramStore((s) => s.addEventRelation);
  const project = useGenogramStore((s) => s.project);
  const [title, setTitle] = useState(event.title);
  const [startDate, setStartDate] = useState(event.startDate);
  const [targetId, setTargetId] = useState('');
  return (
    <div style={{ marginTop: 8, padding: 8, border: '1px dashed #aaa', borderRadius: 6 }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => updateEvent(event.id, { title })} placeholder="Titolo evento" />
      <input value={startDate} onChange={(e) => setStartDate(e.target.value)} onBlur={() => updateEvent(event.id, { startDate })} placeholder="Data" />
      <div style={{ marginTop: 6 }}>
        <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
          <option value="">Collega a evento...</option>
          {project.events.filter((e) => e.id !== event.id).map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <button type="button" onClick={() => { if (targetId) addEventRelation(event.id, targetId, 'related_to'); setTargetId(''); }}>Aggiungi relazione</button>
      </div>
      <button type="button" onClick={() => deleteEvent(event.id)}>Elimina</button>
    </div>
  );
}
