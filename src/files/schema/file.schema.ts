import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { FileType } from 'src/enums/file.type';
import { ObjectId } from '../../types/object-id';

export type FileDocument = File & Document;
export type UniqueFileProp = '_id' | 'slug';

@Schema({ timestamps: true })
export class File {
  @Prop({ type: String, minlength: 2, maxlength: 100, required: true })
  title: string;

  @Prop({
    type: String,
    minlength: 2,
    maxlength: 100,
    required: true,
    unique: true,
  })
  slug: string;

  @Prop({ type: String, minlength: 1, maxlength: 100, required: true })
  extension: string;

  @Prop({ type: String, minlength: 2, maxlength: 100, required: true })
  subject: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  authorId: ObjectId;

  @Prop({ type: String, required: true })
  authorName: string;

  @Prop({ type: String, required: true })
  fileName: string;

  @Prop({ type: Number, required: true })
  fileSize: number;

  @Prop({ enum: FileType })
  type: FileType;
}

export const FileSchema = SchemaFactory.createForClass(File);
FileSchema.index({ title: 'text' });
