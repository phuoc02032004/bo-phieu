import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CastVoteDto {
  @IsNotEmpty()
  @IsMongoId()
  candidateId: Types.ObjectId;
}