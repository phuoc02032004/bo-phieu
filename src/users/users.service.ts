import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './users.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import mongoose from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}


  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const newUser = new this.userModel({ ...createUserDto, password: hashedPassword, verified: false }); 
    return newUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: Types.ObjectId): Promise<UserDocument> {
    const user = await this.userModel.findById(id).populate('participatedElections').exec(); // Make sure to populate participatedElections
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

async update(id: string, userData: Partial<User>): Promise<UserDocument> {
    const userId = new mongoose.Types.ObjectId(id);
    const user = await this.userModel.findByIdAndUpdate(userId, userData, { new: true }).exec();
    if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
}

  async remove(id: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByRefreshToken(refreshToken: string):Promise<UserDocument | null>{
    return this.userModel.findOne({refreshToken}).exec();
  }

  async updateRefreshToken(userId: string, newRefreshToken: string):Promise<UserDocument | null>{
    return this.userModel.findByIdAndUpdate(userId, {refreshToken: newRefreshToken}, {new:true}).exec();
  }


  async matchPassword(enteredPassword: string, user: UserDocument): Promise<boolean> {
    console.log('Entered password:', enteredPassword);
    console.log('Hashed password:', user.password);
    const isMatch = await bcrypt.compare(enteredPassword, user.password);
    return isMatch;
    }
}