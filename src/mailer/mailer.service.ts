import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import nodemailer from 'nodemailer';
import { ContactMessage } from './schema/contact-message.schema';
import { SendContactEmailDto } from './dto/send-contact-email.dto';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(ContactMessage.name)
    private contactMessageModel: Model<ContactMessage>,
    private configService: ConfigService,
  ) {
    // Initialize nodemailer transporter with Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_APP_PASSWORD'),
      },
    });
  }

  async sendEmail(mailOptions: MailOptions): Promise<void> {
    await this.transporter.sendMail(mailOptions);
  }

  async sendContactEmail(
    sendContactEmailDto: SendContactEmailDto,
  ): Promise<ContactMessage> {
    const { name, email, message } = sendContactEmailDto;

    // Create contact message record
    const contactMessage = new this.contactMessageModel({
      name,
      email,
      message,
      status: 'pending',
    });

    try {
      // Email configuration
      const recipientEmail = this.configService.get<string>('MAIL_RECIPIENT');
      const mailOptions = {
        from: this.configService.get<string>('MAIL_USER'),
        to: recipientEmail,
        subject: `Contact Form: Message from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Contact Form Submission</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <div style="background-color: white; padding: 15px; border-left: 4px solid #4CAF50; margin-top: 10px;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This message was sent from your website contact form on ${new Date().toLocaleString()}.
            </p>
          </div>
        `,
        replyTo: email, // Allow easy reply to the sender
      };

      // Send email
      await this.transporter.sendMail(mailOptions);

      // Update status to sent
      contactMessage.status = 'sent';
      contactMessage.sentAt = new Date();
      await contactMessage.save();

      return contactMessage;
    } catch (error) {
      // Update status to failed
      contactMessage.status = 'failed';
      contactMessage.errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      await contactMessage.save();

      throw new InternalServerErrorException(
        'Failed to send email. Please try again later.',
      );
    }
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return this.contactMessageModel.find().sort({ createdAt: -1 }).exec();
  }

  async getContactMessageById(id: string): Promise<ContactMessage | null> {
    return this.contactMessageModel.findById(id).exec();
  }
}
