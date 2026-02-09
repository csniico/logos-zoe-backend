import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PodcastDocument = Podcast & Document;

@Schema({ timestamps: true, collection: 'podcastmodels' })
export class Podcast {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop({ default: true })
  published: boolean;

  @Prop({ type: [String], default: [] })
  hits: string[];

  @Prop({ default: 0 })
  duration: number;
}

export const PodcastSchema = SchemaFactory.createForClass(Podcast);
