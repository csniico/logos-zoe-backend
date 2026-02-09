import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Bookmark subdocument
@Schema({ _id: false })
export class Bookmark {
  @Prop({ required: true, enum: ['article', 'podcast', 'devotional'] })
  resourceType: string;

  @Prop({ required: true })
  resourceId: string;

  @Prop({ default: Date.now })
  bookmarkedAt: Date;
}

@Schema({ timestamps: true, collection: 'usermodels' })
export class User extends Document {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ required: true })
  firstname: string;

  @Prop()
  lastname?: string;

  @Prop({
    default:
      'https://storage.googleapis.com/noahsproject-f916b.appspot.com/Articles/1741539830710_discipleship%201.jpg',
  })
  avatar: string;

  @Prop({ enum: ['admin', 'super-admin', 'user'], default: 'user' })
  role: string;

  @Prop({ type: [Bookmark], default: [] })
  bookmarks: Bookmark[];

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verificationToken?: string;

  @Prop()
  verifiedAt?: Date;

  @Prop({ default: false })
  isSuspended: boolean;

  @Prop()
  suspendedAt?: Date;

  @Prop()
  sessionId?: string;

  @Prop({ type: [Object], default: [] })
  preferences: any[];
}

export const UserSchema = SchemaFactory.createForClass(User);
