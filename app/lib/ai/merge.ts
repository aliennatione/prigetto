import { useGenogramStore } from '../genogram/store';
import { parseOperations } from './operations';

export function applyAiOperations(raw: string) {
  const ops = parseOperations(raw);
  const store = useGenogramStore.getState();
  for (const op of ops) {
    if (op.type === 'addEvent') store.addEvent(op.payload);
    if (op.type === 'updateEvent') store.updateEvent(op.id, op.payload);
  }
  return ops.length;
}
