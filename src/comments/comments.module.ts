import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from '../files/schema/file.schema';
import { Comment, CommentSchema } from './schema/comment.schema';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: File.name, schema: FileSchema },
    ]),
  ],
})
export class CommentsModule {}
