import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from './schema/file.schema';
import { GetFileFiltersMiddleware } from '../middleware/get-file-filters.middleware';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  controllers: [FilesController],
  imports: [
    MongooseModule.forFeature([
      { name: File.name, schema: FileSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(GetFileFiltersMiddleware)
      .forRoutes({ path: '/api/files/type/:type', method: RequestMethod.GET });
  }
}
