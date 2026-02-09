import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SystemMailer extends Document {
  @Prop({ required: true })
  receipients: string[];

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  body: string;

  @Prop({ default: Date.now })
  sentAt: Date;

  @Prop({ enum: ['pending', 'sent', 'failed'], default: 'pending' })
  status: string;

  @Prop()
  errorMessage?: string;
}

export const SystemMailerSchema = SchemaFactory.createForClass(SystemMailer);
