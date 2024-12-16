import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

interface BlockData {
  electionId: mongoose.Types.ObjectId;
  voterId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  timestamp: Date;
}

export type BlockDocument = HydratedDocument<Block>;

@Schema()
export class Block {
  @Prop({ required: true })
  index: number;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ type: Object, required: true })
    data: object;

  @Prop({ required: true })
  previousHash: string;

  @Prop({ required: true })
  hash: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Election' })
  electionId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  voterId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  candidateId: mongoose.Types.ObjectId;
}

export const BlockSchema = SchemaFactory.createForClass(Block);