import { IsNotEmpty, IsString, IsDate, IsArray, ValidateNested, IsOptional, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { User } from '../../users/users.schema'; 
import mongoose, { mongo } from 'mongoose';

export class CandidateDto {
  @IsNotEmpty()
  candidate: string; 
  @IsOptional()
  votes?: number;
}

export class CreateElectionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  creatorId?: string; 

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(0) 
  @ArrayMaxSize(100) 
  @ValidateNested({ each: true })
  @Type(() => CandidateDto)
  candidates: CandidateDto[];

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date) 
  startTime: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date) 
  endTime: Date;
}