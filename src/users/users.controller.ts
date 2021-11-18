import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  CreateUserResponse,
  FindUserResponse,
} from 'src/responses/users.responses';
import * as mongoose from 'mongoose';
import { IdParamPipe } from 'src/pipes/id-param.pipe';
import { JwtAuthGuard } from 'src/auth/jtw-auth.guard';
import { UserInterface } from 'src/interfaces/user.interface';
import { UserObj } from 'src/decorators/user-object.decorator';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<FindUserResponse> {
    return this.usersService.findOne(id);
  }

  @Get('login/:login')
  findByLogin(@Param('login') login: string): Promise<FindUserResponse> {
    return this.usersService.findByLogin(login);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', new IdParamPipe()) id: mongoose.Schema.Types.ObjectId,
    @Body() updateUserDto: UpdateUserDto,
    @UserObj() user: UserInterface,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', new IdParamPipe()) id: mongoose.Schema.Types.ObjectId,
    @UserObj() user: UserInterface,
  ) {
    return this.usersService.remove(id, user);
  }
}
