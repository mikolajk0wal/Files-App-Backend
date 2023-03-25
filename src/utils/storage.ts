import * as path from 'path';
import { diskStorage } from 'multer';
import * as mime from 'mime';
import * as fs from 'fs/promises';
import { v4 as uuid } from 'uuid';
import { FileType } from 'src/enums/file.type';
import { CreateFileDto } from 'src/files/dto/create-file.dto';
import { validate } from 'class-validator';

export function storageDir(): string {
  return 'storage';
}

export function getFolderName(file: Express.Multer.File): FileType {
  const fileExtension = (mime as any).extensions[file.mimetype];
  let folder = FileType.other;
  if (fileExtension === FileType.pdf) {
    folder = FileType.pdf;
  } else if (file.mimetype.split('/')[0] === 'image') {
    folder = FileType.img;
  }
  return folder;
}

export function multerStorage(dest: string) {
  return diskStorage({
    destination: (req, file, cb) => {
      const folder = getFolderName(file);
      cb(null, path.join(dest, folder));
    },
    filename: (req, file, cb) => {
      let error = null;
      const id = uuid();
      const { type: fileType, subject, title } = req.body;
      const fileExtension = (mime as any).extensions[file.mimetype];

      const folder = getFolderName(file);

      const fileDto = new CreateFileDto();
      fileDto.subject = subject;
      fileDto.title = title;

      validate(fileDto).then(async (errors) => {
        if (errors.length > 0) {
          error = errors[0];
          await fs.unlink(
            `${path.join(storageDir(), folder)}/${id}.${fileExtension}`,
          );
        }
      });
      cb(error, `${id}.${fileExtension}`);
    },
  });
}
