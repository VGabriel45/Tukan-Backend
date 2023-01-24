import { Body, Controller, Delete, Ip, Post, Req } from '@nestjs/common';
import { request } from 'http';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import RefreshTokenDto from './dto/refresh-token.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  async signUp(@Body() body: SignupDto) {
    console.log(body);

    return this.authService.signUp(body.username, body.email, body.password);
  }

  @Post('signIn')
  async signIn(@Req() request, @Ip() ip: string, @Body() body: LoginDto) {
    return this.authService.signIn(body.email, body.password, {
      ipAddress: ip,
      userAgent: request.headers['user-agent'],
    });
  }

  @Post('refresh')
  async refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body.refreshToken);
  }

  @Delete('logout')
  async logout(@Body() body: RefreshTokenDto) {
    return this.authService.logout(body.refreshToken);
  }
}
