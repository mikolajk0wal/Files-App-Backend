import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { IdParamPipe } from '../pipes/id-param.pipe';
import { ObjectId } from '../types/object-id';
import {
  CreateCommentResponse,
  GetCommentsResponse,
} from '../responses/comments.responses';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jtw-auth.guard';
import { UserObj } from '../decorators/user-object.decorator';
import { UserInterface } from '../interfaces/user.interface';

@Controller('api/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('/:fileId')
  getFilesComments(
    @Param('fileId', new IdParamPipe()) fileId: ObjectId,
  ): Promise<GetCommentsResponse> {
    return this.commentsService.getFilesComments(fileId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:fileId')
  createComment(
    @UserObj() user: UserInterface,
    @Body() createCommentDto: CreateCommentDto,
    @Param('fileId', new IdParamPipe()) fileId: ObjectId,
    @Query('parent_id', new IdParamPipe(true)) parentId?: string,
  ): Promise<CreateCommentResponse> {
    return this.commentsService.createComment(
      fileId,
      user,
      createCommentDto.message,
      parentId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:commentId')
  deleteComment(
    @UserObj() user: UserInterface,
    @Param('commentId', new IdParamPipe()) commentId: ObjectId,
  ) {
    return this.commentsService.deleteComment(commentId, user);
  }
}
