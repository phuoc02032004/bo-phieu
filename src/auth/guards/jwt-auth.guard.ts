import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt'; 
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import mongoose from 'mongoose';

interface RequestWithUser extends Request {
    user: any;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private usersService: UsersService) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.header('Authorization');

    if (!authHeader) {
      throw new UnauthorizedException({ message: 'Authorization header not found.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException({ message: 'Invalid token format.' });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const userId = new mongoose.Types.ObjectId(payload.id);
      const user = await this.usersService.findOne(userId);

      if (!user) {
        throw new UnauthorizedException({ message: 'User not found.' });
      }

      request.user = user;
      return true;
    } catch (error) {
      console.error('JWT Authentication Error:', error); 
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException({ message: 'Token expired.' });
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({ message: 'Invalid token.' });
      }
      throw new UnauthorizedException({ message: 'Authentication failed.' });
    }
  }
}