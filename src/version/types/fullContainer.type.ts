import { Prisma } from '@prisma/client';

export type FullContainer = Prisma.ContainerGetPayload<{
  include: {
    child: true;
    Snippet: true;
  };
}>;
