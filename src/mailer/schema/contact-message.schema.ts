import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ContactMessage extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: Date.now })
  sentAt: Date;

  @Prop({ enum: ['pending', 'sent', 'failed'], default: 'pending' })
  status: string;

  @Prop()
  errorMessage?: string;
}

export const ContactMessageSchema =
  SchemaFactory.createForClass(ContactMessage);
