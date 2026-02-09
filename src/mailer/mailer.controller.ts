import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendContactEmailDto } from './dto/send-contact-email.dto';
import { API_VERSION_SCHEME } from 'src/utils/constants/global.constants';
import { PublicRoute } from 'src/auth/decorators/public.decorator';

@PublicRoute()
@Controller(`/${API_VERSION_SCHEME}/mailer`)
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('contact')
  async sendContactEmail(@Body() sendContactEmailDto: SendContactEmailDto) {
    const result =
      await this.mailerService.sendContactEmail(sendContactEmailDto);
    return {
      message: 'Email sent successfully',
      data: result,
    };
  }

  @Get('contact-messages')
  async getContactMessages() {
    const messages = await this.mailerService.getContactMessages();
    return {
      data: messages,
    };
  }

  @Get('contact-messages/:id')
  async getContactMessageById(@Param('id') id: string) {
    const message = await this.mailerService.getContactMessageById(id);
    return {
      data: message,
    };
  }
}
