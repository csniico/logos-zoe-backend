import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { loginDto } from './dto/login.dto';
import { UserService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { USER_FOUND_MESSAGE } from 'src/utils/constants/global.constants';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import refreshJwtConfig from './config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';
import type { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async login(body: loginDto, res: Response) {
    try {
      const _user = await this.userService.login(body);

      if (USER_FOUND_MESSAGE.localeCompare(_user.message) !== 0) {
        return new UnauthorizedException();
      }

      if (!_user.data || Object.keys(_user.data).length == 0) {
        return new UnauthorizedException('User not found');
      }

      const payload: AuthJwtPayload = {
        sub: _user.data._id.toString(),
      };
      const token = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(
        payload,
        this.refreshTokenConfig,
      );

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
      });
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
      });

      return { user: _user.data };
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  async refreshToken(id: string) {
    try {
      const _user = await this.userService.findUser(id);

      if (USER_FOUND_MESSAGE.localeCompare(_user.message) !== 0) {
        throw new NotFoundException();
      }

      if (_user instanceof InternalServerErrorException) {
        throw _user;
      }

      const payload: AuthJwtPayload = { sub: _user.data._id.toString() };
      const token = this.jwtService.sign(payload);
      return {
        id,
        token,
      };
    } catch (error) {
      console.log(error);
      if (!(error instanceof InternalServerErrorException)) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}
