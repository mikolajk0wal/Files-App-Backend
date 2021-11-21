import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { UserType } from 'src/enums/user-type';

export class CreateUserDto {
  @IsString()
  @Length(2, 50)
  login: string;

  @IsString()
  @Length(4, 100)
  password: string;

  @IsString()
  @Length(4, 100)
  retypedPassword: string;

  @IsOptional()
  @IsEnum(UserType)
  type?: UserType;
}
