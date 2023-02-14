import { FileInterface } from 'src/interfaces/File';
import mongoose from 'mongoose';

export type FindFileResponse = FileInterface;
export type FindFilesResponse = {
  files: FileInterface[];
  count: number;
  requiredPages: number;
  page: number;
};

export type GetSearchSuggestionsResponse = {
  _id: mongoose.Schema.Types.ObjectId;
  title: string;
}[];

export type CreateFileResponse = FileInterface;
export type UpdateFileResponse = FileInterface;
export type DeleteFileResponse = FileInterface;
