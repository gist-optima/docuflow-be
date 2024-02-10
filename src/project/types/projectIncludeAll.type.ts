import { Prisma } from '@prisma/client';

export type ProjectIncludeAllType = Prisma.ProjectGetPayload<{
  include: {
    users: true;
    Version: true;
  };
}>;
