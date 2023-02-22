import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { File, FileDocument } from '../files/schema/file.schema';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schema/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
}
