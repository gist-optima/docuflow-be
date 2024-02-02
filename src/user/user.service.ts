import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { SignupDto } from './dto/req/signup.dto';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SigninDto } from './dto/req/signin.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async signup({ email, password, name }: SignupDto): Promise<void> {
    const salt = await bcryptjs.genSalt();
    const hashedPassword = await bcryptjs.hash(password, salt);
    if (!name) {
      name = email.split('@')[0];
    }
    return this.userRepository.createUser({
      email,
      password: hashedPassword,
      name,
    });
  }

  async signin({ email, password }: SigninDto): Promise<string> {
    const user = await this.userRepository.findUserByEmail(email).catch(() => {
      throw new UnauthorizedException();
    });
    if (!(await bcryptjs.compare(password, user.password))) {
      throw new UnauthorizedException();
    }
    return this.jwtService.sign({ email: user.email, sub: user.id });
  }
}
