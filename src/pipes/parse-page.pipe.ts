import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParsePagePipe implements PipeTransform {
  constructor(private defaultValue: number, private maxValue?: number) {}
  transform(value: string, metadata: ArgumentMetadata): number {
    if (!value) {
      return this.defaultValue;
    } 
    const page = parseInt(value);

    if (isNaN(page)) {
      return this.defaultValue;
    }
    if (this.maxValue && page > this.maxValue) {
      throw new BadRequestException(`Page is bigger than ${this.maxValue}`);
    }
    if (page <= 0) {
      return this.defaultValue;
    }
    return page;
  }
}
