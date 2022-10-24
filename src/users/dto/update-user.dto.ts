import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { UserType } from '../../enums/user-type';

export class UpdateUserDto {
  @IsString()
  @Length(4, 100)
  password: string;

  @IsString()
  @Length(4, 100)
  @IsOptional()
  newPassword?: string;

  @IsString()
  @Length(4, 100)
  @IsOptional()
  retypedNewPassword?: string;

  @IsString()
  @Length(2, 50)
  @IsOptional()
  login?: string;
}
