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

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true, collection: 'categorymodels' })
export class Category {
  @Prop({ required: true, unique: true })
  category_name: string;

  @Prop({ default: '' })
  category_banner: string;

  @Prop({ default: '' })
  category_icon: string; // could be a font-awesome icon code

  @Prop({ default: '' })
  category_introText: string;

  @Prop({ default: '' })
  category_fullText: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Article' }], default: [] })
  related_ArticlesIds: Types.ObjectId[];

  @Prop({ type: Array, default: [] })
  comments: Array<unknown>;

  @Prop()
  color?: string;

  @Prop()
  description?: string;

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
}

export const CategorySchema = SchemaFactory.createForClass(Category);
