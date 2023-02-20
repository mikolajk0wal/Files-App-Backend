import {
  BadRequestException,
  HttpException,
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
  GetSearchSuggestionsResponse,
  UpdateFileResponse,
} from 'src/responses/files.responses';
import { getFolderName, storageDir } from 'src/utils/storage';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { File, FileDocument } from './schema/file.schema';
import { UserInterface } from 'src/interfaces/user.interface';
import { ObjectId } from 'src/types/object-id';
import { UserType } from 'src/enums/user-type';
import { User, UserDocument } from '../users/schemas/user.schema';
import { FilesSortByProperty } from '../enums/sort-by';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(
    createFileDto: CreateFileDto,
    uploadedFile: Express.Multer.File,
    user: UserInterface,
  ): Promise<CreateFileResponse> {
    if (!uploadedFile) {
      throw new BadRequestException('Nie dodano pliku');
    }
    const fileType = getFolderName(uploadedFile);

    const sameTitleFilesCount = await this.fileModel.count({
      title: createFileDto.title,
    });
    const slug = this.generateSlug(sameTitleFilesCount, createFileDto.title);
    const file = await this.fileModel.create({
      ...createFileDto,
      authorId: user._id,
      authorName: user.login,
      fileName: uploadedFile.filename,
      fileSize: uploadedFile.size,
      type: fileType,
      slug,
    });
    return this.filter(file);
  }

  async sendFile(id: ObjectId, res: any): Promise<any> {
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
    subject,
    title,
    authorName,
    sortBy: sortByProperty,
    perPage = 9,
  }: {
    filters: any;
    page?: number;
    sort?: SortType;
    sortBy?: FilesSortByProperty;
    type?: FileType;
    perPage?: number;
    title?: string;
    subject?: string;
    authorName?: string;
  }): Promise<FindFilesResponse> {
    const skip = (page - 1) * perPage;
    const sortOrder = sort ? (sort === SortType.desc ? -1 : 1) : -1;
    const isSearching = !!title;
    let sortBy = {};

    if (isSearching) {
      sortBy = {
        score: -1,
        createdAt: sortOrder,
      };
    } else {
      sortBy = { [sortByProperty ? sortByProperty : 'createdAt']: sortOrder };
    }
    if (type) {
      filters.type = type;
    }

    const pipeline: any = [
      { $match: filters },
      {
        $addFields: {
          score: { $meta: 'searchScore' },
        },
      },
      { $sort: sortBy },
    ];

    if (isSearching) {
      pipeline.unshift({
        $search: {
          index: 'default',
          text: {
            query: title,
            path: 'title',
            fuzzy: {},
          },
        },
      });
    }

    try {
      const files = await this.fileModel.collection
        .aggregate([...pipeline, { $skip: skip }, { $limit: perPage }])
        .toArray();
      if (!files.length) {
        throw new NotFoundException('Nie znaleziono plików');
      }

      const [{ count }] = await this.fileModel.collection
        .aggregate([
          ...pipeline,
          {
            $count: 'count',
          },
        ])
        .toArray();
      return {
        files: files.map((file) => this.filter(file)),
        requiredPages: Math.ceil(count / perPage),
        count,
        page,
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException('Spróbuj jeszcze raz', 400);
    }
  }
  async getSearchSuggestions(
    title: string,
    { authorName, type }: { authorName?: string; type?: FileType },
  ): Promise<GetSearchSuggestionsResponse> {
    const filters: any = {};
    if (authorName) {
      filters.authorName = authorName;
    }
    if (type) {
      filters.type = type;
    }
    const pipeline: any = [
      {
        $search: {
          index: 'autocomplete',
          autocomplete: {
            query: title,
            path: 'title',
            tokenOrder: 'sequential',
          },
        },
      },
      { $match: filters },
      { $limit: 10 },
      { $project: { title: 1 } },
    ];

    return (await this.fileModel.collection
      .aggregate(pipeline)
      .toArray()) as GetSearchSuggestionsResponse;
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

    const canUpdate = await this.canUpdate(user, file.authorId.toString());

    if (!canUpdate) {
      throw new UnauthorizedException('Nie możesz edytować czyjegoś pliku');
    }

    let slug;

    if (updateFileDto.title) {
      const sameTitleFilesCount = await this.fileModel.count({
        title: updateFileDto.title,
      });
      slug = this.generateSlug(sameTitleFilesCount, updateFileDto.title);
    }

    await this.fileModel.findByIdAndUpdate(id, {
      ...updateFileDto,
      slug: slug ? slug : file.slug,
    });
    const updatedFile = await this.fileModel.findById(id);
    return this.filter(updatedFile);
  }

  async remove(id: ObjectId, user: UserInterface): Promise<DeleteFileResponse> {
    const file = await this.fileModel.findById(id);
    if (!file) {
      throw new NotFoundException('Nie znaleziono pliku');
    }
    const canRemove = await this.canUpdate(user, file.authorId.toString());
    if (!canRemove) {
      throw new UnauthorizedException('Nie możesz usunąć czyjegoś pliku');
    }
    await fs.unlink(`${path.join(storageDir(), file.type)}/${file.fileName}`);
    return this.filter(await this.fileModel.findByIdAndDelete(id));
  }

  //Check if user can edit or remove files
  private async canUpdate(user: UserInterface, authorId: string) {
    const owner = await this.userModel.findOne({ _id: authorId });
    return (
      authorId === user._id.toString() ||
      user.type === UserType.admin ||
      (user.type === UserType.moderator && owner.type === UserType.normal)
    );
  }

  private generateSlug(sameTitleFiles: number, title: string): string {
    const formattedTitle = title
      .toLowerCase()
      .split(' ')
      .join('-')
      .replace('(', '')
      .replace(')', '');

    const slug =
      sameTitleFiles === 0
        ? `${formattedTitle}`
        : `${formattedTitle}-${sameTitleFiles + 1}`;

    return slug;
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
      fileSize,
      slug,
    } = file;
    return {
      _id,
      title,
      slug,
      authorId,
      authorName,
      subject,
      type,
      createdAt,
      updatedAt,
      fileSize,
    };
  }
}
