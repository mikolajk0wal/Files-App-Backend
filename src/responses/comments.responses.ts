import { UserType } from '../enums/user-type';
import { ObjectId } from '../types/object-id';

export interface Comment {
  _id: ObjectId;
  message: string;
  authorId: ObjectId;
  authorName: string;
  authorRole: UserType;
  fileId: ObjectId;
  parentId?: ObjectId;
}

export interface GetCommentsResponse {
  fileId: ObjectId;
  comments: Comment[];
}

export type CreateCommentResponse = Comment;
export type DeleteCommentResponse = Comment;
