import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
const must = [
  'dist/index.html',
  'dist/dashboard/index.html',
  'dist/edit/index.html',
  'src/components/GenogramEditor.svelte',
  'src/components/AiTherapistPanel.svelte',
  'src/components/TimelinePanel.svelte',
];
let ok = true;
for (const p of must) {
  try { await access(new URL('./'+p, import.meta.url), constants.F_OK); console.log('OK', p); }
  catch { console.error('MISS', p); ok = false; }
}
if (!ok) process.exit(1);
console.log('smoke: pass');
