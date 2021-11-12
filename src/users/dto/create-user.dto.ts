import { IsString, Length } from 'class-validator';

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
}
