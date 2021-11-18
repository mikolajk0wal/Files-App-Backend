import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileType } from 'src/enums/file.type';
import { SortType } from 'src/enums/sort.type';
import { FileInterface } from 'src/interfaces/File';
import {
  CreateFileResponse,
  DeleteFileResponse,
  FindFileResponse,
  FindFilesResponse,
  UpdateFileResponse,
} from 'src/responses/files.responses';
import { storageDir } from 'src/utils/storage';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { File, FileDocument } from './schema/file.schema';
import * as path from 'path';
import * as mongoose from 'mongoose';
import { UserInterface } from 'src/interfaces/user.interface';
import { ObjectId } from 'src/types/object-id';

@Injectable()
export class FilesService {
  constructor(@InjectModel(File.name) private fileModel: Model<FileDocument>) {}

  async create(
    createFileDto: CreateFileDto,
    uploadedFile: Express.Multer.File,
    user: UserInterface,
  ): Promise<CreateFileResponse> {
    if (!uploadedFile) {
      throw new BadRequestException('Nie dodano pliku');
    }
    const file = await this.fileModel.create({
      ...createFileDto,
      authorId: user._id,
      authorName: user.login,
      fileName: uploadedFile.filename,
    });
    return this.filter(file);
  }

  async findAll(): Promise<FindFilesResponse> {
    const files = await this.fileModel.find({});
    if (!files.length) {
      throw new NotFoundException('Nie znaleziono plików');
    }
    return files.map((file) => this.filter(file));
  }

  async findFile(id: ObjectId, res: any): Promise<any> {
    const file = await this.fileModel.findById(id);
    if (!file) {
      throw new NotFoundException('Cannot find music');
    }
    res.sendFile(file.fileName, {
      root: path.join(storageDir(), file.type),
    });
  }

  async findById(id: ObjectId): Promise<FindFileResponse> {
    const file = await this.fileModel.findById(id);
    if (!file) {
      throw new NotFoundException('Nie znaleziono pliku');
    }
    return this.filter(file);
  }

  async findByType(
    type: FileType,
    sort: SortType = SortType.asc,
  ): Promise<FindFilesResponse> {
    const files = await this.fileModel.find({ type }).sort({ createdAt: sort });
    if (!files.length) {
      throw new NotFoundException('Nie znaleziono plików');
    }
    return files.map((file) => this.filter(file));
  }

  async update(
    id: ObjectId,
    updateFileDto: UpdateFileDto,
  ): Promise<UpdateFileResponse> {
    const file = await this.fileModel.findById(id);
    if (!file) {
      throw new NotFoundException('Nie znaleziono pliku');
    }
    await this.fileModel.findByIdAndUpdate(id, updateFileDto);
    const updatedFile = await this.fileModel.findById(id);
    return this.filter(updatedFile);
  }

  async remove(id: ObjectId, user: UserInterface): Promise<DeleteFileResponse> {
    const file = await this.fileModel.findById(id);
    if (!file) {
      throw new NotFoundException('Nie znaleziono pliku');
    }
    if (file.authorId.toString() !== user._id.toString()) {
      throw new UnauthorizedException('Nie możesz usunąć czyjegoś pliku');
    }
    return this.filter(await this.fileModel.findByIdAndDelete(id));
  }

  private filter(file: any): FileInterface {
    const {
      title,
      authorId,
      authorName,
      subject,
      type,
      createdAt,
      updatedAt,
      _id,
    } = file;
    return {
      _id,
      title,
      authorId,
      authorName,
      subject,
      type,
      createdAt,
      updatedAt,
    };
  }
}
