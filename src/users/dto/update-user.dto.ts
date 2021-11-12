import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, Length } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto {
  @IsString()
  @Length(2, 50)
  @IsOptional()
  login: string;

  @IsString()
  @Length(4, 100)
  password: string;

  @IsString()
  @Length(4, 100)
  retypedPassword: string;

  @IsString()
  @Length(4, 100)
  @IsOptional()
  newPassword: string;

  @IsString()
  @Length(4, 100)
  @IsOptional()
  retypedNewPassword: string;
}
