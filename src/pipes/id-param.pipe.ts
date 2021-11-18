import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import * as mongoose from 'mongoose';
import { isMongoId } from 'class-validator';

@Injectable()
export class IdParamPipe implements PipeTransform {
  transform(
    value: any,
    metadata: ArgumentMetadata,
  ): mongoose.Schema.Types.ObjectId {
    if (!isMongoId(value)) {
      throw new BadRequestException('Niepoprawne ID');
    }
    return value;
  }
}
