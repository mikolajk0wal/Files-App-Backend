import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileType } from 'src/enums/file.type';
import { SortType } from 'src/enums/sort.type';

@Injectable()
export class FileTypeGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const fileType = request?.params?.type ?? null;
    if (
      fileType !== FileType.img &&
      fileType !== FileType.pdf &&
      fileType !== FileType.pptx
    ) {
      throw new BadRequestException('Błędnie podany typ pliku');
    } else {
      return true;
    }
  }
}
