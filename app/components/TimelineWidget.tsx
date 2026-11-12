'use client';

import { useMemo } from 'react';

import { type EventKind, type Project, type TimelineEventV2 } from '../lib/genogram/model';
import { useGenogramStore } from '../lib/genogram/store';

export interface TimelineWidgetProps {
  project: Project;
  personId: string;
}

export function selectTimelineForPerson(project: Project, personId: string): TimelineEventV2[] {
  return project.events
    .filter((event) => event.linkedEntities.some((link) => link.entityType === 'person' && link.entityId === personId))
    .slice()
    .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
}

const kindLabels: Record<EventKind, string> = {
  birth: 'Nascita',
  death: 'Morte',
  marriage: 'Matrimonio',
  separation: 'Separazione',
  divorce: 'Divorzio',
  relocation: 'Trasferimento',
  illness: 'Malattia',
  therapy: 'Terapia',
  trauma: 'Trauma',
  loss: 'Perdita',
  achievement: 'Traguardo',
  reunion: 'Riunione',
  conflict: 'Conflitto',
  custom: 'Evento',
};

export function TimelineWidget({ project, personId }: TimelineWidgetProps) {
  const events = useMemo(() => selectTimelineForPerson(project, personId), [project, personId]);
  const addEvent = useGenogramStore((state) => state.addEvent);

  return (
    <section aria-label="Timeline persona" style={{ marginTop: 12, padding: 8, border: '1px solid #ddd', borderRadius: 8 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Timeline</strong>
        <button type="button" onClick={() => addEvent({
          id: `event-${Date.now()}`,
          title: 'Nuovo evento',
          kind: 'custom',
          startDate: '',
          datePrecision: 'unknown',
          linkedEntities: [{ entityType: 'person', entityId: personId }],
        })}>
          + Evento
        </button>
      </header>
      {events.length === 0 ? (
        <p style={{ color: '#666', fontSize: 12 }}>Nessun evento collegato.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
          {events.map((event) => (
            <li key={event.id} style={{ marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>{event.startDate || '—'}</span>{' '}
              <span>{kindLabels[event.kind] ?? event.kind}: {event.title}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
