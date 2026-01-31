import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthConstants } from './constants';

@Injectable()
export class AuthService {
  @Inject() prisma: PrismaService;
  @Inject() jwt: JwtService;
  @Inject() user: UsersService;

  generateAccessToken(userId: number) {
    return this.jwt.sign(
      { sub: userId },
      { expiresIn: AuthConstants.ACCESS_TOKEN_EXPIRES },
    );
  }

  generateRefreshToken(userId: number) {
    return this.jwt.sign(
      { sub: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: AuthConstants.REFRESH_TOKEN_EXPIRE,
      },
    );
  }

  async login(email: string, password: string) {
    const user = await this.user.findUnique({ email, password });

    if (!user) {
      throw new UnauthorizedException();
    }

    console.log('user', user);
    console.log('password', password);
    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = user.password === password;
    if (!isMatch) throw new UnauthorizedException();

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
    const refreshTokenExpiresTime =
      Date.now() + AuthConstants.REFRESH_TOKEN_EXPIRE_IN;

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(refreshTokenExpiresTime),
      },
    });

    return { accessToken, refreshToken };
  }
}
