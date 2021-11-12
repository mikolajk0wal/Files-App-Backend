import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { SortType } from 'src/enums/sort.type';

@Injectable()
export class SortGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const sortType = request?.query?.sort ?? null;
    if (sortType && sortType !== SortType.asc && sortType !== SortType.desc) {
      throw new BadRequestException('Błędnie podany argument sortowania');
    } else {
      return true;
    }
  }
}
