import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from './users/schema/user.schema';
import { UserSeeder } from './users/users.seeder';
import { AuthModule } from './auth/auth.module';
import { DevotionalsModule } from './devotionals/devotionals.module';
import { StorageModule } from './storage/storage.module';
import { DocumentModule } from './document/document.module';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { BibleModule } from './bible/bible.module';
import { CategoryModule } from './category/category.module';
import { ArticleModule } from './article/article.module';
import { PodcastModule } from './podcast/podcast.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MailerModule } from './mailer/mailer.module';
import { Podcast, PodcastSchema } from './podcast/schema/podcast.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    MongooseModule.forRoot(
      (() => {
        // Strip quotes from env variables (Docker --env-file includes them)
        const stripQuotes = (value: string) =>
          value.replace(/^["']|["']$/g, '');

        const user = encodeURIComponent(
          stripQuotes(process.env.MONGO_USER || ''),
        );
        const password = encodeURIComponent(
          stripQuotes(process.env.MONGO_PASSWORD || ''),
        );
        const host = process.env.MONGO_HOST || 'localhost';
        const database = process.env.MONGO_APP_NAME || 'test';
        const appName = process.env.MONGO_APP_NAME || 'app';

        const connectionString = `mongodb+srv://${user}:${password}@${host}/${database}?retryWrites=true&w=majority&appName=${appName}`;

        // Log connection details (without exposing password)
        Logger.log(`Connecting to MongoDB...`, 'MongoDBConnection');
        Logger.log(`Host: ${host}`, 'MongoDBConnection');
        Logger.log(`Database: ${database}`, 'MongoDBConnection');
        Logger.log(`App Name: ${appName}`, 'MongoDBConnection');
        Logger.log(`User: ${process.env.MONGO_USER}`, 'MongoDBConnection');

        return connectionString;
      })(),
      {
        connectionFactory: (connection: Connection) => {
          connection.on('connected', () => {
            Logger.log(
              `Successfully connected to database: ${connection.db?.databaseName || 'unknown'}`,
              'MongoDBConnection',
            );
          });
          connection.on('error', (error: Error) => {
            Logger.error(
              `MongoDB connection error: ${error}`,
              'MongoDBConnection',
            );
          });
          connection.on('disconnected', () => {
            Logger.warn('MongoDB disconnected', 'MongoDBConnection');
          });
          return connection;
        },
      },
    ),
    UsersModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Podcast.name, schema: PodcastSchema },
    ]),
    AuthModule,
    DevotionalsModule,
    StorageModule,
    DocumentModule,
    BibleModule,
    CategoryModule,
    ArticleModule,
    PodcastModule,
    AnalyticsModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserSeeder],
})
export class AppModule implements OnModuleInit {
  constructor(private userSeeder: UserSeeder) {}

  async onModuleInit() {
    await this.userSeeder.seed();
  }

  configure(consumer: import('@nestjs/common').MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
