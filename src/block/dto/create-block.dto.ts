import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BlockDataDto {
  @IsNotEmpty()
  electionId: string;

  @IsNotEmpty()
  voterId: string;

  @IsNotEmpty()
  candidateId: string;
}

export class CreateBlockDto {
  @IsNotEmpty()
  index: number;

  @IsNotEmpty()
  previousHash: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => BlockDataDto)
  data: BlockDataDto;
}