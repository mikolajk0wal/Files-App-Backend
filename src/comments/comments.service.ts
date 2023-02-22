import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { File, FileDocument } from '../files/schema/file.schema';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schema/comment.schema';
import { GetCommentsResponse } from '../responses/comments.responses';
import { ObjectId } from '../types/object-id';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async getFilesComments(fileId: ObjectId): Promise<GetCommentsResponse> {
    const comments = await this.commentModel.find({ fileId });
    if (!comments.length) {
      throw new NotFoundException('Nie znaleziono komentarzy');
    }
    return {
      fileId,
      comments,
    };
  }
}
