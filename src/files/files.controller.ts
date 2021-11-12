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
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import {
  CreateFileResponse,
  DeleteFileResponse,
  FindFileResponse,
  FindFilesResponse,
  UpdateFileResponse,
} from 'src/responses/files.responses';
import { FileType } from 'src/enums/file.type';
import { multerStorage, storageDir } from 'src/utils/storage';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { SortType } from 'src/enums/sort.type';
import { SortGuard } from 'src/guards/sort.guard';
import { UserObj } from 'src/decorators/user-object.decorator';
import { JwtAuthGuard } from '../auth/jtw-auth.guard';
import { UserInterface } from 'src/interfaces/user.interface';

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

  @Get()
  findAll(): Promise<FindFilesResponse> {
    return this.filesService.findAll();
  }

  @Get('file/:id')
  findFile(@Res() res: any, @Param('id') id: string): Promise<any> {
    return this.filesService.findFile(id, res);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<FindFileResponse> {
    return this.filesService.findById(id);
  }

  @Get('/type/:type')
  @UseGuards(SortGuard)
  findByType(
    @Param('type') type: FileType,
    @Query('sort') sort?: SortType,
  ): Promise<FindFilesResponse> {
    return this.filesService.findByType(type, sort);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
  ): Promise<UpdateFileResponse> {
    return this.filesService.update(id, updateFileDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,
    @UserObj() user: UserInterface,
  ): Promise<DeleteFileResponse> {
    return this.filesService.remove(id, user);
  }
}
