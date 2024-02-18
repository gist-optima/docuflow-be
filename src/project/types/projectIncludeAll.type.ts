import { Prisma } from '@prisma/client';

export type ProjectIncludeAllType = Prisma.ProjectGetPayload<{
  include: {
    users: {
      select: {
        id: true;
        email: true;
        name: true;
      };
    };
    PullRequest: true;
    Version: {
      include: {
        child: {
          select: { id: true };
        };
        mergeChild: {
          select: { id: true };
        };
      };
    };
  };
}>;
