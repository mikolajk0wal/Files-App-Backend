import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { File, FileSchema } from 'src/files/schema/file.schema';
import { FilesModule } from '../files/files.module';
import { GetFileFiltersMiddleware } from '../middleware/get-file-filters.middleware';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: File.name, schema: FileSchema },
    ]),
    FilesModule,
  ],
  exports: [UsersService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(GetFileFiltersMiddleware)
      .forRoutes({ path: '/api/users/files/:id', method: RequestMethod.GET });
  }
}
