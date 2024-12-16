import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../users/users.schema';
import { Model } from 'mongoose';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email }).select('+password').exec();
    console.log('Start validate:', email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await this.authService.matchPassword(password, user);
    if (!isMatch || !user.verified) { 
      throw new UnauthorizedException('Invalid credentials or account not verified');
    }
    return user;
  }
}