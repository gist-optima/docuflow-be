import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from './dto/req/signup.dto';
import { SigninDto } from './dto/req/signin.dto';
import { Response, response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<void> {
    return this.userService.signup(signupDto);
  }

  @Post('signin')
  async signin(
    @Body() signupDto: SigninDto,
    @Res() response: Response,
  ): Promise<void> {
    const accessToken = await this.userService.signin(signupDto);
    response.setHeader('Authorization', `Bearer ${accessToken}`);
    response.cookie('accessToken', accessToken, { httpOnly: true });
  }

  @Post('signout')
  async signout(@Res() response: Response): Promise<void> {
    response.clearCookie('accessToken');
  }
}
