import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true }) 
export class User {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  })
  email: string;

  @Prop({
    required: true,
    minLength: 6,
    select: false, 
  })
  password: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop()
  phone?: number;

  @Prop({ default: null })
  verificationCode?: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ enum: ['customer', 'admin'], default: 'customer' })
  role: string;

  @Prop({ default: null })
  refreshToken?: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Election' }])
  createdElections: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Election' }] })
  participatedElections: mongoose.Types.ObjectId[];

}

export const UserSchema = SchemaFactory.createForClass(User);