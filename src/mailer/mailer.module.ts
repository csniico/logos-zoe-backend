import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import {
  ContactMessage,
  ContactMessageSchema,
} from './schema/contact-message.schema';
import { BullModule } from '@nestjs/bullmq';
import {
  SystemMailer,
  SystemMailerSchema,
} from './schema/system-mailer.schema';
import {
  PrayerRequest,
  PrayerRequestSchema,
} from './schema/prayer-request.schema';
import { PrayerRequestService } from './prayer-request.service';
import { ContactMessageService } from './contact-message.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: ContactMessage.name, schema: ContactMessageSchema },
      { name: SystemMailer.name, schema: SystemMailerSchema },
      { name: PrayerRequest.name, schema: PrayerRequestSchema },
    ]),
    BullModule.registerQueue({ name: 'logos-zoe-mailer' }),
  ],
  controllers: [MailerController],
  providers: [MailerService, PrayerRequestService, ContactMessageService],
  exports: [MailerService],
})
export class MailerModule {}
