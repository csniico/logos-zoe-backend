import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import {
  ContactMessage,
  ContactMessageSchema,
} from './schema/contact-message.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: ContactMessage.name, schema: ContactMessageSchema },
    ]),
  ],
  controllers: [MailerController],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
