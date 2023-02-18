import * as mongoose from 'mongoose';
import { FileType } from 'src/enums/file.type';

export interface FileInterface {
  _id: mongoose.Schema.Types.ObjectId;
  title: string;
  subject: string;
  authorId: mongoose.Schema.Types.ObjectId;
  authorName: string;
  type: FileType;
  createdAt: string;
  updatedAt: string;
  fileSize: number;
}
