import { ApiProperty } from '@nestjs/swagger';
import { FindUserInfoType } from 'src/user/types/findUserInfo.type';

export class FindUserInfo implements FindUserInfoType {
  @ApiProperty({
    example: 1,
    description: '유저의 고유 아이디',
  })
  id: number;

  @ApiProperty({
    example: 'JohnDoe@gmail.com',
    description: '유저의 이메일',
  })
  email: string;
}
