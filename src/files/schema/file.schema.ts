import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { FileType } from 'src/enums/file.type';
import { ObjectId } from '../../types/object-id';

export type FileDocument = File & Document;

@Schema({ timestamps: true })
export class File {
  @Prop({ type: String, minlength: 2, maxlength: 100, required: true })
  title: string;

  @Prop({ type: String, minlength: 2, maxlength: 100, required: true })
  subject: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  authorId: ObjectId;

  @Prop({ type: String, required: true })
  authorName: string;

  @Prop({ type: String, required: true })
  fileName: string;

  @Prop({ enum: FileType })
  type: FileType;
}

export const FileSchema = SchemaFactory.createForClass(File);
FileSchema.index({ title: 'text' });
