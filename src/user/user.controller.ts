import {
  Body,
  Controller,
  Delete,
  Post,
  Get,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from './dto/req/signup.dto';
import { SigninDto } from './dto/req/signin.dto';
import { Response, response } from 'express';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { FindUserInfo } from './types/findUserInfo.type';
import { AccessTokenGuard } from './guard/accessToken.guard';

@ApiTags('User')
@Controller('user')
@UsePipes(ValidationPipe)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBody({
    type: SignupDto,
    examples: {
      withName: {
        value: {
          email: 'siwon1115@gm.gist.ac.kr',
          password: 'password1234',
          name: 'siwon',
        },
      },
      withoutName: {
        value: {
          email: 'siwon1115@gm.gist.ac.kr',
          password: 'password1234',
        },
      },
    },
    description:
      '회원가입을 위한 정보를 담은 객체, name은 입력되지 않는다면 email의 @ 앞부분이 name으로 설정된다.',
  })
  @ApiCreatedResponse({ description: '회원가입 성공' })
  @ApiConflictResponse({ description: '이미 존재하는 이메일' })
  @ApiInternalServerErrorResponse({ description: '서버 에러' })
  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<void> {
    return this.userService.signup(signupDto);
  }

  @ApiCreatedResponse({ description: '로그인 성공' })
  @ApiUnauthorizedResponse({ description: '로그인 실패' })
  @Post('signin')
  async signin(
    @Body() signupDto: SigninDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const accessToken = await this.userService.signin(signupDto);
    response.setHeader('Authorization', `Bearer ${accessToken}`);
    response.cookie('accessToken', accessToken, { httpOnly: true });
  }

  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @Delete('signout')
  async signout(@Res({ passthrough: true }) response: Response): Promise<void> {
    response.clearCookie('accessToken');
    return;
  }

  @Get('search')
  @UseGuards(AccessTokenGuard)
  async searchUserByEmail(
    @Query('keyword') keyword: string,
  ): Promise<FindUserInfo[]> {
    return this.userService.findUserInfoByEmail(keyword);
  }
}
