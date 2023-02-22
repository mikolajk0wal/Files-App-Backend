import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { ObjectId } from '../../types/object-id';
import { UserType } from '../../enums/user-type';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, minlength: 1, maxlength: 500, required: true })
  message: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  authorId: ObjectId;

  @Prop({ type: String, required: true })
  authorName: string;

  @Prop({ default: UserType.normal, enum: UserType, type: String })
  authorRole: UserType;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  fileId: ObjectId;

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId })
  parentId?: ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
