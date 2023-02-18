import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { SortType } from 'src/enums/sort.type';
import { fileSortProperties } from '../enums/file-sort-by';

@Injectable()
export class SortGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const sortType = request?.query?.sort ?? null;
    const sortBy = request?.query?.sort_by ?? null;
    if (sortType && sortType !== SortType.asc && sortType !== SortType.desc) {
      throw new BadRequestException('Błędnie podany argument sortowania');
    }
    if (sortBy && sortBy !== 'updatedAt' && sortBy !== '') {
      const isNotValidSortBy = !!fileSortProperties.find(
        (prop) => prop === sortBy,
      );
      if (isNotValidSortBy) {
        throw new BadRequestException('Błędnie podane pole do sortowania');
      }
    }
    return true;
  }
}
