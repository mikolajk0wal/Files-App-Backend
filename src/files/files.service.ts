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
import { File, FileDocument, UniqueFileProp } from './schema/file.schema';
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
  ) {
    if (!uploadedFile) {
      throw new BadRequestException('Nie dodano pliku');
    }
    const fileType = getFolderName(uploadedFile);

    const extension = uploadedFile.originalname.split('.').pop();

    const slug = await this.generateSlug(createFileDto.title);
    const file = await this.fileModel.create({
      ...createFileDto,
      authorId: user._id,
      authorName: user.login,
      fileName: uploadedFile.filename,
      fileSize: uploadedFile.size,
      type: fileType,
      slug,
      extension,
    });
    return file;
  }

  async sendFile(
    property: UniqueFileProp,
    value: ObjectId | string,
    res: any,
  ): Promise<any> {
    const file = await this.findUnique(property, value);
    const exists = await this.checkIfFileExistInFolder(
      file.type,
      file.fileName,
    );
    if (!exists) {
      throw new NotFoundException('Nie znaleziono pliku');
    }
    res.sendFile(file.fileName, {
      root: path.join(storageDir(), file.type),
    });
  }

  async findUnique(property: UniqueFileProp, value: string | ObjectId) {
    const file = await this.fileModel.findOne({ [property]: value });
    if (!file) {
      throw new NotFoundException('Nie znaleziono pliku');
    }

    return file;
  }

  async search({
    filters,
    page = 1,
    sort = SortType.desc,
    title,
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
  }) {
    const skip = (page - 1) * perPage;
    const isSearching = !!title;
    const sortBy = this.generateSortByObject({
      isSearching,
      sortType: sort,
      sortByProperty,
    });

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
        files: files,
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
    const filters = this.generateFilters([
      { key: 'authorName', value: authorName },
      { key: 'type', value: type },
    ]);

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
  ) {
    const file = await this.fileModel.findById(id);
    if (!file) {
      throw new NotFoundException('Nie znaleziono pliku');
    }

    const canUpdate = await this.hasPermission(user, file.authorId.toString());

    if (!canUpdate) {
      throw new UnauthorizedException('Nie możesz edytować czyjegoś pliku');
    }

    const slug = updateFileDto.title
      ? await this.generateSlug(updateFileDto.title)
      : file.slug;

    await this.fileModel.findByIdAndUpdate(id, {
      ...updateFileDto,
      slug,
    });
    const updatedFile = await this.fileModel.findById(id);
    return updatedFile;
  }

  async remove(id: ObjectId, user: UserInterface) {
    const file = await this.fileModel.findById(id);
    if (!file) {
      throw new NotFoundException('Nie znaleziono pliku');
    }
    const canRemove = await this.hasPermission(user, file.authorId.toString());
    if (!canRemove) {
      throw new UnauthorizedException('Nie możesz usunąć czyjegoś pliku');
    }
    await fs.unlink(`${path.join(storageDir(), file.type)}/${file.fileName}`);
    return await this.fileModel.findByIdAndDelete(id);
  }

  filterFile(file: any): FileInterface {
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
      extension,
    } = file;
    return {
      _id,
      extension,
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

  private async checkIfFileExistInFolder(type: FileType, name: string) {
    return fs
      .access(`${path.join(storageDir(), type)}/${name}`)
      .then(() => true)
      .catch(() => false);
  }

  private async hasPermission(user: UserInterface, authorId: string) {
    const owner = await this.userModel.findOne({ _id: authorId });
    return (
      authorId === user._id.toString() ||
      user.type === UserType.admin ||
      (user.type === UserType.moderator && owner.type === UserType.normal)
    );
  }

  private async generateSlug(title: string) {
    const formattedTitle = title
      .toLowerCase()
      .split(' ')
      .join('-')
      .replace('(', '')
      .replace(')', '');

    const sameTitleFilesCount = await this.fileModel.count({
      title,
    });

    const slug =
      sameTitleFilesCount === 0
        ? `${formattedTitle}`
        : `${formattedTitle}-${sameTitleFilesCount + 1}`;

    return slug;
  }

  private generateFilters(filterProperties: { key: string; value: string }[]) {
    const filters = {};
    filterProperties.forEach((filterProperty) => {
      if (!filterProperty || !filterProperty.value) return;
      filters[filterProperty.key] = filterProperty.value;
    });
    return filters;
  }

  private generateSortByObject({
    isSearching,
    sortType,
    sortByProperty,
  }: {
    isSearching: boolean;
    sortType: SortType;
    sortByProperty?: string;
  }) {
    const sortTypeAsNumber = this.transformSortTypeToNumber(sortType);
    if (isSearching) {
      return {
        score: -1,
        createdAt: sortTypeAsNumber,
      };
    } else {
      return {
        [sortByProperty ? sortByProperty : 'createdAt']: sortTypeAsNumber,
      };
    }
  }

  private transformSortTypeToNumber(sortType: SortType) {
    return sortType ? (sortType === SortType.desc ? -1 : 1) : -1;
  }
}
