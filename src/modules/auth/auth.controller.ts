/* eslint-disable prettier/prettier */
// src/auth/auth.controller.ts
import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import {
  ForgetPasswordDto,
  GoogleLoginDto,
  LoginDto,
  RegisterDto,
  Update2FADto,
} from 'src/utils/auth.dto';
import { OtpService } from '../otp/otp.service';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.user_name,
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    return this.authService.login(email, password);
  }
  @Post('google-login')
  async googleLogin(@Body() GoogleLoginDto: GoogleLoginDto) {
    const user = GoogleLoginDto;
    const dbUser = await this.authService.findOrCreateGoogleUser(user);
    const jwt = await this.authService.generateJwt(dbUser);
    return {
      message: 'Google login successful',
      user: dbUser,
      token: jwt,
    };
  }
  @Post('logout')
  @HttpCode(200)
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.json({ message: 'Logged out successfully' });
  }
  @Post('send-otp')
  async send(@Body() body: { email: string }) {
    return this.otpService.sendOtp(body.email);
  }
  @Post('forget-password')
  async forgetPassword(@Body() ForgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(ForgetPasswordDto);
  }
  @Post('verify-otp')
  async verifyOtp(@Body() Update2FADto: Update2FADto) {
    return this.otpService.verifyOtp(Update2FADto.email, Update2FADto.otp);
  }

  @Get('getData')
  async getAllUsers(@Req() req) {
    const tenantId = req.headers['x-tenant-id'];
    return this.authService.getUserData(tenantId);
  }
}
