import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    try {
      const user = await this.authService.register(registerUserDto);
      return { message: 'Registration successful, please check your email for verification.' };
    } catch (error) {
      throw error; 
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      return this.authService.login(loginUserDto);
    } catch (error) {
      throw error;
    }
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    try {
      await this.authService.verifyEmail(verifyEmailDto.verificationCode);
      return { message: 'Email verification successful' };
    } catch (error) {
      throw error;
    }
  }


  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(resetPasswordDto); 
      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/:id')
  getProfileById(@Param('id') id:string, @Request() req: any){
    return req.user;
  }

}