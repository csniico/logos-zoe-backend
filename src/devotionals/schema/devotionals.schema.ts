import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { biblePassagesInterface } from '../dto/setDevotionalDocument.dto';

export type DevotionalDocument = Devotional & Document;

@Schema({ timestamps: true, collection: 'devotionals' })
export class Devotional {
  @Prop({ required: true })
  day: string;

  @Prop({ required: true })
  month: string;

  @Prop({ required: true })
  year: string;

  @Prop()
  title?: string;

  @Prop()
  scripture?: string;

  @Prop()
  questions?: string;

  @Prop()
  author?: string;

  @Prop()
  content?: string;

  @Prop()
  biblePassages?: Array<biblePassagesInterface>;

  @Prop()
  listOfImageAssets?: Array<string>;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop({ default: true })
  published: boolean;

  @Prop({ default: 'new' })
  type: string;

  @Prop()
  migratedAt?: Date;

  @Prop()
  fileUrl?: string;

  @Prop()
  fileKey?: string;

  @Prop({ type: [String], default: [] })
  hits: string[];
}

export const DevotionalSchema = SchemaFactory.createForClass(Devotional);
