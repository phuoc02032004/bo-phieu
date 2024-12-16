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

    console.log('JWT_SECRET in env:' , process.env.JWT_SECRET)
    console.log('Authorization Header:', authHeader); 

    if (!authHeader) {
      throw new UnauthorizedException({ message: 'Authorization header not found.' });
    }

    const token = authHeader.split(' ')[1];
    console.log('JWT Token:', token); 
    if (!token) {
      throw new UnauthorizedException({ message: 'Invalid token format.' });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      console.log('JWT Payload:', payload); 
      console.log('Payload ID:', payload.id);
      const userId = new mongoose.Types.ObjectId(payload.id);
      console.log('User ID (ObjectId):', userId);
      const user = await this.usersService.findOne(userId);

      console.log('User found:', user); 

      if (!user) {
        throw new UnauthorizedException({ message: 'User not found.' });
      }

      request.user = user;
      console.log('Request User set:', request.user); 
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