import { IsOptional, IsNumber } from 'class-validator';

export class UpdateCandidateDto {
  @IsOptional()
  @IsNumber()
  votes?: number;
}