import { useGenogramStore } from '../genogram/store';
import { type TimelineEventV2 } from '../genogram/model';
import { parseOperations } from './operations';

export function applyAiOperations(raw: string) {
  const ops = parseOperations(raw);
  const store = useGenogramStore.getState();
  for (const op of ops) {
    if (op.type === 'addEvent') store.addEvent(op.payload as TimelineEventV2);
    if (op.type === 'updateEvent') store.updateEvent(op.id, op.payload as Partial<TimelineEventV2>);
  }
  return ops.length;
}
