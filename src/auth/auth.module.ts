import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/users.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from '../utils/email.service';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UtilsModule } from '../utils/utils.module';

@Module({
    imports: [
      UsersModule,
      UtilsModule,
      PassportModule,
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
            const secret = configService.get('jwt.secret');
            if (!secret) {
                console.error('JWT_SECRET not found!');
                throw new Error('JWT_SECRET is required.');
            }
            return {
                secret,
                signOptions: { expiresIn: '30d', algorithm: 'HS256' },
            };
        },
    }),
      ConfigModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, LocalStrategy, EmailService, JwtAuthGuard, LocalAuthGuard, UsersService],
    exports: [AuthService, JwtModule],
})
  export class AuthModule {}