import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ContactMessage } from './schema/contact-message.schema';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ContactMessagePayload } from './interfaces/contact-message.interface';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { ContactMessageTemplate } from './templates/contact-message.template';
import { MailerService } from './mailer.service';

@Injectable()
export class ContactMessageService {
  private readonly logger = new Logger(ContactMessageService.name);
  private RECIPIENT_EMAIL: string;

  constructor(
    @InjectModel(ContactMessage.name)
    private readonly contactMessageModel: Model<ContactMessage>,
    private configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {
    const recipient = this.configService.get<string>(
      'CONTACT_MAIL_RECIPIENT',
      '',
    );

    if (!recipient) {
      this.logger.warn(
        'CONTACT_MAIL_RECIPIENT is not set. Contact form emails will not be sent.',
      );
      throw new InternalServerErrorException(
        'Server configuration error: CONTACT_MAIL_RECIPIENT is not set.',
      );
    }
    this.RECIPIENT_EMAIL = recipient;
  }

  async process(payload: ContactMessagePayload): Promise<void> {
    await this.save(payload);
    await this.mailerService.sendEmail(this.constructEmailOptions(payload));
  }

  private generateEmailContent(payload: ContactMessagePayload): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const emailContent = ReactDOMServer.renderToStaticMarkup(
      React.createElement(ContactMessageTemplate, payload),
    );
    return emailContent as string;
  }

  private constructEmailOptions(payload: ContactMessagePayload) {
    return {
      from: this.configService.get<string>('MAIL_USER'),
      to: this.RECIPIENT_EMAIL,
      subject: `Contact Form: Message from ${payload.name}`,
      html: this.generateEmailContent(payload),
    };
  }

  private async save(payload: ContactMessagePayload) {
    try {
      const contactMessage = new this.contactMessageModel({
        name: payload.name,
        email: payload.email,
        message: payload.message,
        status: 'pending',
      });
      await contactMessage.save();
    } catch (error) {
      this.logger.error('Failed to save contact message', error);
      // export to external logging service.
    }
  }
}
