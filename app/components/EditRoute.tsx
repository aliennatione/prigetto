'use client';

import { useSearchParams } from 'next/navigation';

import GenogramEditor from './GenogramEditor';
import AiTherapistPanel from './AiTherapistPanel';
import PersonTimelinePanel from './PersonTimelinePanel';
import GlobalTimelinePanel from './GlobalTimelinePanel';

export default function EditRoute() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  return (
    <>
      <GenogramEditor key={projectId ?? 'missing-project'} projectId={projectId} />
      <AiTherapistPanel />
      <PersonTimelinePanel />
      <GlobalTimelinePanel />
    </>
  );
}
