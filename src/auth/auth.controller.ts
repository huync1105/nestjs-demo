import {
  Body,
  Controller,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
@Public()
export class AuthController {
  @Inject() auth: AuthService;
  @Inject() jwt: JwtService;
  @Inject() prisma: PrismaService;

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const { email, password } = dto;
    console.log({ email, password });
    return this.auth.login(email, password);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const payload = this.jwt.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const existedRefreshToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!existedRefreshToken) throw new UnauthorizedException();

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      accessToken: this.auth.generateAccessToken(payload.sub),
    };
  }
}
