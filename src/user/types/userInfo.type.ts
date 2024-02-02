import { User } from '@prisma/client';

export type UserInfo = Pick<User, 'id' | 'email'>;
