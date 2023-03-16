import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { File, FileDocument } from '../files/schema/file.schema';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schema/comment.schema';
import {
  CreateCommentResponse,
  DeleteCommentResponse,
  GetCommentsResponse,
} from '../responses/comments.responses';
import { ObjectId } from '../types/object-id';
import { UserInterface } from '../interfaces/user.interface';
import { UserType } from '../enums/user-type';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async getFilesComments(fileId: ObjectId): Promise<GetCommentsResponse> {
    const comments = await this.commentModel
      .find({ fileId })
      .sort({ createdAt: 'desc' });
    if (!comments.length) {
      throw new NotFoundException('Nie znaleziono komentarzy');
    }
    return {
      fileId,
      comments,
    };
  }

  async createComment(
    fileId: ObjectId,
    user: UserInterface,
    message: string,
    parentId?: string,
  ): Promise<CreateCommentResponse> {
    const file = await this.fileModel.findById(fileId);
    if (!file) {
      throw new NotFoundException('Plik o podanym id nie istnieje');
    }
    if (parentId) {
      const parentComment = await this.commentModel.findById(parentId);
      if (!parentComment) {
        throw new NotFoundException(
          'Komentarz na ktory chcesz odpowiedziec nie istnieje',
        );
      }
    }
    return await this.commentModel.create({
      fileId,
      message,
      authorId: user._id,
      authorName: user.login,
      authorRole: user.type,
      parentId,
    });
  }

  async deleteComment(
    commentId: ObjectId,
    user: UserInterface,
  ): Promise<DeleteCommentResponse> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Komentarz ktory chcesz usunac nie istnieje');
    }
    if (
      user.login !== comment.authorName &&
      user.type !== UserType.moderator &&
      user.type !== UserType.admin
    ) {
      throw new UnauthorizedException('Nie możesz usunąć czyjegos komentarza');
    }
    await this.commentModel.deleteOne({ _id: commentId });

    return comment;
  }
}
