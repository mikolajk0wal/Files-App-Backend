import * as path from 'path';
import { diskStorage } from 'multer';
import * as mime from 'mime';
import * as fs from 'fs/promises';
import { v4 as uuid } from 'uuid';
import { FileType } from 'src/enums/file.type';
import { BadRequestException } from '@nestjs/common';
import { CreateFileDto } from 'src/files/dto/create-file.dto';
import { validate } from 'class-validator';

export function storageDir(): string {
  return 'storage';
}

export function todaysDate(): string {
  const day = new Date().getDate();
  const month =
    new Date().getMonth() + 1 < 10
      ? `0${new Date().getMonth() + 1}`
      : new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  const date = `${day}${month}${year}`;
  return date;
}

export function multerStorage(dest: string) {
  fs;
  return diskStorage({
    destination: (req, file, cb) => {
      const { type: fileType } = req.body;
      let error = null;
      if (
        fileType !== FileType.img &&
        fileType !== FileType.pdf &&
        fileType !== FileType.pptx
      ) {
        error = new BadRequestException('Zły typ pliku');
      }
      cb(error, path.join(dest, req.body.type));
    },
    filename: (req, file, cb) => {
      let error = null;
      const id = uuid();
      const { type: fileType, subject, title } = req.body;
      const fileExtension = (mime as any).extensions[file.mimetype];
      if (fileExtension !== fileType && fileType !== FileType.img) {
        error = new BadRequestException(
          'Rozszerzenie pliku nie zgadza się z typem pliku',
        );
      } else if (
        fileType === FileType.img &&
        file.mimetype.slice(0, 5) !== 'image'
      ) {
        error = new BadRequestException(
          'Rozszerzenie pliku nie zgadza się z typem pliku',
        );
      }
      const fileDto = new CreateFileDto();
      fileDto.subject = subject;
      fileDto.title = title;
      fileDto.type = fileType;

      validate(fileDto).then(async (errors) => {
        if (errors.length > 0) {
          error = errors[0];
          await fs.unlink(
            `${path.join(storageDir(), fileType)}/${id}.${fileExtension}`,
          );
        }
      });
      cb(error, `${id}.${fileExtension}`);
    },
  });
}
