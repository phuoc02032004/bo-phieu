import { IsOptional, IsString } from 'class-validator';

export class FindElectionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  creatorId?: string;
}