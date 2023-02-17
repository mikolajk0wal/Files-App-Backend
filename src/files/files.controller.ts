import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  Res,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import {
  CreateFileResponse,
  DeleteFileResponse,
  FindFileResponse,
  FindFilesResponse,
  GetSearchSuggestionsResponse,
  UpdateFileResponse,
} from 'src/responses/files.responses';
import { FileType } from 'src/enums/file.type';
import { multerStorage, storageDir } from 'src/utils/storage';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as mongoose from 'mongoose';
import { SortType } from 'src/enums/sort.type';
import { SortGuard } from 'src/guards/sort.guard';
import { UserObj } from 'src/decorators/user-object.decorator';
import { JwtAuthGuard } from '../auth/jtw-auth.guard';
import { UserInterface } from 'src/interfaces/user.interface';
import { IdParamPipe } from 'src/pipes/id-param.pipe';
import { FileTypeGuard } from 'src/guards/file-type.guard';
import { ObjectId } from 'src/types/object-id';
import { ParsePagePipe } from 'src/pipes/parse-page.pipe';

@Controller('api/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerStorage(path.join(storageDir())),
    }),
  )
  create(
    @Body() createFileDto: CreateFileDto,
    @UploadedFile() file: Express.Multer.File,
    @UserObj() user: UserInterface,
  ): Promise<CreateFileResponse> {
    return this.filesService.create(createFileDto, file, user);
  }

  @Get('file/:id')
  findFile(
    @Res() res: any,
    @Param('id', new IdParamPipe()) id: ObjectId,
  ): Promise<any> {
    return this.filesService.findFile(id, res);
  }

  @Get(':id')
  findById(
    @Param('id', new IdParamPipe()) id: ObjectId,
  ): Promise<FindFileResponse> {
    return this.filesService.findById(id);
  }

  @Get('')
  @UseGuards(SortGuard, FileTypeGuard)
  search(
    @Req() req: any,
    @Query('type') type: FileType,
    @Query('page', new ParsePagePipe(1)) page: number,
    @Query('sort') sort?: SortType,
    @Query('per_page', new ParsePagePipe(9)) perPage?: number,
    @Query('q') title?: string,
    @Query('subject') subject?: string,
    @Query('authorName') authorName?: string,
  ): Promise<FindFilesResponse> {
    return this.filesService.search({
      filters: req.filters,
      page,
      sort,
      type,
      perPage,
      subject,
      title,
      authorName,
    });
  }

  @UseGuards(FileTypeGuard)
  @Get('autocomplete/:title')
  getSearchSuggestions(
    @Param('title') title: string,
    @Query('authorName') authorName?: string,
    @Query('type') type?: FileType,
  ): Promise<GetSearchSuggestionsResponse> {
    return this.filesService.getSearchSuggestions(title, { authorName, type });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', new IdParamPipe()) id: ObjectId,
    @Body() updateFileDto: UpdateFileDto,
    @UserObj() user: UserInterface,
  ): Promise<UpdateFileResponse> {
    return this.filesService.update(id, updateFileDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', new IdParamPipe()) id: ObjectId,
    @UserObj() user: UserInterface,
  ): Promise<DeleteFileResponse> {
    return this.filesService.remove(id, user);
  }
}
