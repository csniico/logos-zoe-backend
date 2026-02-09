import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { StorageModule } from 'src/storage/storage.module';
import { Podcast, PodcastSchema } from 'src/podcast/schema/podcast.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Podcast.name,
        schema: PodcastSchema,
      },
    ]),
    StorageModule,
  ],
  controllers: [UsersController],
  providers: [UserService, RolesGuard],
  exports: [UserService],
})
export class UsersModule {}
