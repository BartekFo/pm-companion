import { ForbiddenError } from '@casl/ability';
import { getCurrentUserAbility } from './get-ability';

export async function checkProjectAccess(projectId: string) {
  const ability = await getCurrentUserAbility();

  ForbiddenError.from(ability).throwUnlessCan('read', 'Project', {
    id: projectId,
  } as any);
}

export async function checkProjectManagement(projectId: string) {
  const ability = await getCurrentUserAbility();

  ForbiddenError.from(ability).throwUnlessCan('manage', 'Project', {
    id: projectId,
  } as any);
}

export async function checkFileUpload(projectId: string) {
  const ability = await getCurrentUserAbility();

  ForbiddenError.from(ability).throwUnlessCan('upload', 'ProjectFile', {
    projectId,
  } as any);
}
