import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isMongoId } from 'class-validator';
import { ObjectId } from 'src/types/object-id';

@Injectable()
export class IdParamPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): ObjectId {
    if (!isMongoId(value)) {
      throw new BadRequestException('Niepoprawne ID');
    }
    return value;
  }
}
