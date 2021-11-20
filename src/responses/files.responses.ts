import { FileInterface } from 'src/interfaces/File';

export type FindFileResponse = FileInterface;
export type FindFilesResponse = {
  files: FileInterface[];
  count: number;
  requiredPages: number;
  page: number;
};
export type CreateFileResponse = FileInterface;
export type UpdateFileResponse = FileInterface;
export type DeleteFileResponse = FileInterface;
