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
    Version: true;
  };
}>;
