import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface biblePassagesInterface {
  book: string;
  chapters: {
    number: number;
    startVerse?: number;
    endVerse?: number;
  }[];
}

export type ArticleDocument = Article & Document;

@Schema({ timestamps: true, collection: 'articlemodels' })
export class Article {
  @Prop({ required: true })
  article_title: string;

  @Prop({ default: '' })
  article_image: string;

  @Prop({ default: '' })
  article_fullText: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId; // stores category _id

  @Prop({ type: Array, default: [] })
  comments: Array<unknown>;

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

  @Prop()
  fileUrl?: string;

  @Prop()
  fileKey?: string;

  @Prop({ type: [String], default: [] })
  hits: string[];
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
