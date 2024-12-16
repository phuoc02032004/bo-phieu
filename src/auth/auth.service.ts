import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../utils/email.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface'; 

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
    private emailService: EmailService,
    private jwtService: JwtService, // Inject JwtService
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{accessToken: string, refreshToken: string}> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (existingUser) {
      throw new BadRequestException('Email already in use.');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = await this.userModel.create({ ...createUserDto, password: hashedPassword, verificationCode, verified: false });
    await this.emailService.sendVerificationEmail(newUser.email, verificationCode);
    return this.generateTokens(newUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userModel.findOne({ email: loginUserDto.email }).select('+password').exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    const isMatch = await this.matchPassword(loginUserDto.password, user);
    if (!isMatch || !user.verified) {
      throw new UnauthorizedException('Invalid credentials or account not verified.');
    }
    return this.generateTokens(user);
  }

  async verifyEmail(verificationCode: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ verificationCode }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid verification code.');
    }
    user.verified = true;
    await user.save();
    return user;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const user = await this.userModel.findOne({ email: resetPasswordDto.email }).exec();
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    const resetPasswordToken = this.emailService.generateResetPasswordToken(); // Make sure this method exists in EmailService
    await this.emailService.sendResetPasswordEmail(user.email, resetPasswordToken); // Make sure this method exists in EmailService
  }

  async matchPassword(enteredPassword: string, user: UserDocument): Promise<boolean> {
    return bcrypt.compare(enteredPassword, user.password);
  }

  private generateTokens(user: UserDocument): { accessToken: string; refreshToken: string } {
    const payload: JwtPayload = { id: user._id.toString(), email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  }
}