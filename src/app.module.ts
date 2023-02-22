import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import mongooseConfig from './config/mongoose.config';
import { FrontendMiddleware } from './middleware/frontend.middleware';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    FilesModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule.forFeature(mongooseConfig)],
      useFactory: async (configService: ConfigService) =>
        configService.get('mongoose'),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'build'),
    }),
    CommentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(FrontendMiddleware)
      .exclude({
        path: 'api/(.*)',
        method: RequestMethod.ALL,
      })
      .forRoutes({
        path: '/**', // For all routes
        method: RequestMethod.ALL, // For all methods
      });
  }
}
