import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { UserInterface } from 'src/interfaces/user.interface';
import {
  CreateUserResponse,
  FindUserResponse,
} from 'src/responses/users.responses';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { File, FileDocument } from 'src/files/schema/file.schema';
import { ObjectId } from 'src/types/object-id';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    const { password, retypedPassword, login } = createUserDto;
    const user = await this.userModel.findOne({ login });
    if (user) {
      throw new BadRequestException(
        `Istnieje już użytkownik z loginem ${login}`,
      );
    }
    if (password !== retypedPassword) {
      throw new BadRequestException('Hasła się nie zgadzają');
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    return this.filter(await this.userModel.create({ login, passwordHash }));
  }

  async findOne(id: ObjectId): Promise<FindUserResponse> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('Nie znaleziono użytkownika');
    }
    return this.filter(user);
  }

  async findByLogin(login: string): Promise<FindUserResponse> {
    const user = await this.userModel.findOne({ login });
    if (!user) {
      throw new NotFoundException(
        `Nie znaleziono użytkownika o loginie ${login}`,
      );
    }
    return this.filter(user);
  }

  async update(
    id: ObjectId,
    updateUserDto: UpdateUserDto,
    updatingUser: UserInterface,
  ) {
    const {
      login,
      password,
      retypedPassword,
      newPassword,
      retypedNewPassword,
    } = updateUserDto;
    const user = await this.userModel.findById(id);
    if (user._id.toString() !== updatingUser._id.toString()) {
      throw new UnauthorizedException('Nie możesz usunąć czyjegoś konta');
    }
    if (!user) {
      throw new NotFoundException('Nie znaleziono użytkownika');
    }
    const checkLoginExist = login
      ? await this.userModel.findOne({ login })
      : false;
    if (checkLoginExist) {
      throw new BadRequestException(
        `Użytkownik o loginie ${login} już istnieje`,
      );
    }
    return `This action updates a #${id} user`;
  }

  async remove(id: ObjectId, deletingUser: UserInterface) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('Nie znaleziono użytkownika');
    }
    if (user._id.toString() !== deletingUser._id.toString()) {
      throw new UnauthorizedException('Nie możesz usunąć czyjegoś konta');
    }
    await this.fileModel.deleteMany({ authorId: id });
    return this.filter(await this.userModel.findByIdAndDelete(id));
  }

  private filter(user: any): UserInterface {
    const { login, createdAt, updatedAt, _id } = user;
    return {
      _id,
      login,
      createdAt,
      updatedAt,
    };
  }
}
