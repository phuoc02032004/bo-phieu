import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import mongoose from 'mongoose';


@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try{
      const user = await this.usersService.create(createUserDto);
      return { message: 'User created successfully', user };
    } catch(error){
      throw error;
    }
  }


  @Get()
  async findAll() {
    try {
      const users = await this.usersService.findAll();
      return users;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const userId = new mongoose.Types.ObjectId(id); 
      const user = await this.usersService.findOne(userId);
      return user;
    } catch (error) {
      throw error;
    }
  }


  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try{
      const user = await this.usersService.update(id, updateUserDto);
      return { message: 'User updated successfully', user };
    } catch(error){
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.usersService.remove(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}