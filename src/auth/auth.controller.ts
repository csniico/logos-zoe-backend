import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto } from './dto/login.dto';
import { API_VERSION_SCHEME } from 'src/utils/constants/global.constants';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import type { AuthenticatedRequest } from './types/authenticatedRequest';
import { PublicRoute } from './decorators/public.decorator';
import type { Response } from 'express';

@Controller(`${API_VERSION_SCHEME}/auth`)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @Post('/login')
  @HttpCode(200)
  login(@Body() body: loginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(body, res);
  }

  @PublicRoute()
  @HttpCode(202)
  @UseGuards(RefreshAuthGuard)
  @Post('/refresh-token')
  refreshToken(@Req() req: AuthenticatedRequest) {
    return this.authService.refreshToken(req.user.id);
  }
}
