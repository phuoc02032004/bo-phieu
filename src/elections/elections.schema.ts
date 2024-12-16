import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

export type ElectionDocument = Election & Document;

@Schema({ timestamps: true })
export class Election {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creatorId: mongoose.Types.ObjectId;

  @Prop([{
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
  }])
  candidates: { candidate: mongoose.Types.ObjectId; votes: number }[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  participants: mongoose.Types.ObjectId[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  voters: mongoose.Types.ObjectId[];

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;
}

export const ElectionSchema = SchemaFactory.createForClass(Election);