import { Prisma } from '@prisma/client';
import { RecursiveContainer } from './fullContainer.type';

export type FullVersion = Prisma.VersionGetPayload<{
  include: {
    Container: {
      include: {
        child: true;
        Snippet: true;
      };
    };
    Snippet: true;
    firstLayerContainer: true;
    firstLayerSnippet: true;
  };
}>;

export type FullVersionWithRecursiveContainer = Omit<
  FullVersion,
  'Container'
> & {
  Container: RecursiveContainer[];
};

export type ExtendedVersion = Prisma.VersionGetPayload<{
  include: {
    Container: true;
    Snippet: true;
    firstLayerContainer: true;
    firstLayerSnippet: true;
  };
}>;
