import { Controller, Get, Param, Post } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { IdParamPipe } from '../pipes/id-param.pipe';
import { ObjectId } from '../types/object-id';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('/:fileId')
  getFilesComments(@Param('fileId', new IdParamPipe()) fileId: ObjectId) {
    return this.commentsService.getFilesComments(fileId);
  }

  @Post('/:fileId')
  createComment() {}
}
