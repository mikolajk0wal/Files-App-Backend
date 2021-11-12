import { IsEnum, IsString, Length } from 'class-validator';
import { FileType } from 'src/enums/file.type';

export class CreateFileDto {
  @IsString({ message: 'Tytuł musi być tekstem' })
  @Length(2, 100, { message: 'Tytuł musi mieć długość od 2 do 100 znaków' })
  title: string;

  @IsString({ message: 'Temat musi być tekstem' })
  @Length(2, 100, { message: 'Temat musi mieć długość od 2 do 100 znaków' })
  subject: string;

  @IsEnum(FileType, { message: 'Typ pliku musi być poprawny (pdf, img, pptx)' })
  type: FileType;
}
