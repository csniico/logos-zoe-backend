import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PrayerRequest extends Document {
  @Prop({ required: false })
  title: string | null;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  topic: string;

  @Prop({ required: true })
  anonymous: boolean;

  @Prop({ required: false })
  email: string | null;

  @Prop({ required: false })
  name: string | null;

  @Prop({ default: Date.now })
  sentAt: Date;

  @Prop({ enum: ['pending', 'sent', 'failed'], default: 'pending' })
  status: string;

  @Prop()
  errorMessage?: string;
}

export const PrayerRequestSchema = SchemaFactory.createForClass(PrayerRequest);
