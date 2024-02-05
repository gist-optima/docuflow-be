import { Prisma } from '@prisma/client';

export type FullVersion = Prisma.VersionGetPayload<{
  include: {
    Container: {
      include: {
        child: true;
        Snippet: true;
      };
    };
    Snippet: true;
  };
}>;

export type ExtendedVersion = Prisma.VersionGetPayload<{
  include: {
    Container: true;
    Snippet: true;
  };
}>;
