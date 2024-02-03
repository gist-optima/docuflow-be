import { Prisma } from '@prisma/client';

export type ProjectIncludeAll = Prisma.ProjectGetPayload<{
  include: {
    users: true;
    Version: true;
  };
}>;
