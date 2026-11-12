import { NextResponse } from 'next/server';

import { generateGenogramProject, type GenogramGenerationSpec } from '../../../lib/genogram/generation-spec';
import { getProjectFileName, serializeProject } from '../../../lib/genogram/project-file';

import { isAuthorized } from '../../../lib/genogram/http-auth';

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  try {
    const { project, warnings } = generateGenogramProject(body as GenogramGenerationSpec);
    return NextResponse.json({
      fileName: getProjectFileName(project),
      peopleCount: project.people.length,
      relationshipCount: project.relationships.length,
      warnings,
      project,
      serialized: serializeProject(project),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
