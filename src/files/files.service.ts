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
import * as fs from 'fs/promises';
import * as path from 'path';
import { FileInterface } from 'src/interfaces/File';
import {
  CreateFileResponse,
  DeleteFileResponse,
  FindFileResponse,
  FindFilesResponse,
  UpdateFileResponse,
} from 'src/responses/files.responses';
import { getFolderName, storageDir } from 'src/utils/storage';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { File, FileDocument } from './schema/file.schema';
import { UserInterface } from 'src/interfaces/user.interface';
import { ObjectId } from 'src/types/object-id';
import { UserType } from 'src/enums/user-type';

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
    const fileType = getFolderName(uploadedFile);
    const file = await this.fileModel.create({
      ...createFileDto,
      authorId: user._id,
      authorName: user.login,
      fileName: uploadedFile.filename,
      type: fileType,
    });
    return this.filter(file);
  }

  async findFile(id: ObjectId, res: any): Promise<any> {
    const file = await this.fileModel.findById(id);
    if (!file) {
      throw new NotFoundException('Cannot find file');
    }
    const exists = await fs
      .access(`${path.join(storageDir(), file.type)}/${file.fileName}`)
      .then(() => true)
      .catch(() => false);

    if (exists) {
      res.sendFile(file.fileName, {
        root: path.join(storageDir(), file.type),
      });
    } else {
      throw new NotFoundException('Nie znaleziono pliku');
    }
  }

  async findById(id: ObjectId): Promise<FindFileResponse> {
    const file = await this.fileModel.findById(id);
    if (!file) {
      throw new NotFoundException('Nie znaleziono pliku');
    }

    return this.filter(file);
  }

  async search({
    filters,
    page = 1,
    sort = SortType.desc,
    type,
    perPage = 9,
  }: {
    filters: any;
    page?: number;
    sort?: SortType;
    type?: FileType;
    perPage?: number;
  }): Promise<FindFilesResponse> {
    const skip = (page - 1) * perPage;
    const sortOrder = sort ? sort : 'desc';
    const isSearching = !!filters['$text'];
    let sortBy = {};

    if (isSearching) {
      sortBy = {
        score: { $meta: 'textScore' },
        updatedAt: sortOrder,
      };
    } else {
      sortBy = { updatedAt: sortOrder };
    }
    if (type) {
      filters.type = type;
    }
    const files = await this.fileModel
      .find(filters, isSearching ? { score: { $meta: 'textScore' } } : {})
      .skip(skip)
      .limit(perPage)
      .sort(sortBy)
      .exec();
    if (!files.length) {
      throw new NotFoundException('Nie znaleziono plików');
    }

    const count = await this.fileModel.countDocuments(filters).exec();

    return {
      files: files.map((file) => this.filter(file)),
      requiredPages: Math.ceil(count / perPage),
      count,
      page,
    };
  }

  async update(
    id: ObjectId,
    updateFileDto: UpdateFileDto,
    user: UserInterface,
  ): Promise<UpdateFileResponse> {
    const file = await this.fileModel.findById(id);
    if (!file) {
      throw new NotFoundException('Nie znaleziono pliku');
    }
    //@TODO Zrobić żeby moderator nie mógł edywać i usuwać plików dodanych przez admina i innych modów (To może tylko admin)
    if (
      file.authorId.toString() !== user._id.toString() &&
      user.type !== UserType.admin &&
      user.type !== UserType.moderator
    ) {
      throw new UnauthorizedException('Nie możesz edytować czyjegoś pliku');
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
    if (
      file.authorId.toString() !== user._id.toString() &&
      user.type !== UserType.admin &&
      user.type !== UserType.moderator
    ) {
      throw new UnauthorizedException('Nie możesz usunąć czyjegoś pliku');
    }
    await fs.unlink(`${path.join(storageDir(), file.type)}/${file.fileName}`);
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
