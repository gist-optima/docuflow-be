import { Prisma, Snippet } from '@prisma/client';

export type FullContainer = Prisma.ContainerGetPayload<{
  include: {
    child: true;
    Snippet: true;
  };
}>;

export type RecursiveContainer = Omit<FullContainer, 'child'> & {
  child: RecursiveContainer[];
};

export type DiffSnippet = Snippet & {
  version: number;
};

export type DiffRecursiveContainer = Omit<
  FullContainer,
  'child' | 'snippet'
> & {
  Snippet: DiffSnippet[];
  child: DiffRecursiveContainer[];
};

export type ExtendedContainer = Prisma.ContainerGetPayload<{
  include: {
    Snippet: true;
    child: true;
    firstLayeredVersion: true;
  };
}>;
