import { User } from '@prisma/client';

export type FindUserInfo = Pick<User, 'id' | 'email'>;
