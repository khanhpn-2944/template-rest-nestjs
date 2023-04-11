import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthTokenDto } from './dto/auth-token.dto';
import { Payload } from './index.type';
import { User } from '../entities/user.entity';
import { AppConStant } from '../shared/constants/app.constant';
import { compare } from '../shared/utils/bcypt.util';
import { UserService } from '../user/user.service';
import { AuthErrorConstant } from '../errors/auth-errors.constant';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(user: User): Promise<AuthTokenDto> {
    return this.createToken(user.email, user.id);
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userService.findByUsername(username);

    if (!user || !(await compare(password, user.password))) {
      throw new UnauthorizedException(AuthErrorConstant.wrongLoginInfo);
    }

    return user;
  }

  private async createToken(username: string, userId: string) {
    const payload = { username, sub: userId };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: AppConStant.jwtRefreshExpiresIn,
    });

    const accessTokenExpiresOn = new Date(
      (this.jwtService.decode(accessToken) as Payload).exp * 1000,
    );
    const refreshTokenExpiresOn = new Date(
      (this.jwtService.decode(refreshToken) as Payload).exp * 1000,
    );
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresOn,
      refreshTokenExpiresOn,
    };
  }
}
