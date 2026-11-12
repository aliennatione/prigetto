import { NextResponse } from 'next/server';

import { validateProject } from '../../../lib/genogram/model';
import { getProjectFileName, serializeProject } from '../../../lib/genogram/project-file';

import { isAuthorized } from '../../../lib/genogram/http-auth';

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const projectInput = body && typeof body === 'object' && 'project' in body ? (body as { project: unknown }).project : body;
  try {
    const project = validateProject(projectInput);
    return NextResponse.json({
      valid: true,
      fileName: getProjectFileName(project),
      project,
      serialized: serializeProject(project),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Project validation failed.';
    return NextResponse.json({ valid: false, error: message }, { status: 400 });
  }
}
