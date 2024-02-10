import { User } from '@prisma/client';

export type FindUserInfoType = Pick<User, 'id' | 'email'>;
