import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { UserType } from 'src/enums/user-type';
import { CreateUserDto } from './create-user.dto';

// export class UpdateUserDto {
//   @IsString()
//   @Length(2, 50)
//   @IsOptional()
//   login: string;

//   @IsString()
//   @Length(4, 100)
//   password: string;

//   @IsString()
//   @Length(4, 100)
//   retypedPassword: string;

//   @IsString()
//   @Length(4, 100)
//   @IsOptional()
//   newPassword: string;

//   @IsString()
//   @Length(4, 100)
//   @IsOptional()
//   retypedNewPassword: string;

//   @IsOptional()
//   @IsEnum(UserType)
//   type?: UserType;
// }

export class UpdateUserDto extends PartialType(CreateUserDto) {}
