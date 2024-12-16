import { IsOptional, IsString } from 'class-validator';

export class FindBlockDto {
  @IsOptional()
  @IsString()
  hash?: string;

  @IsOptional()
  @IsString()
  electionId?: string;
}