import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import refreshJwtConfig from '../config/refresh-jwt.config';
import { refreshTokenCookieExtractor } from '../utils/cookie-extractor';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
  ) {
    if (!refreshJwtConfiguration.secret) {
      throw new InternalServerErrorException(
        'jwtConfiguration cannot find secret value or secret is undefined.',
      );
    }
    super({
      jwtFromRequest: refreshTokenCookieExtractor,
      secretOrKey: refreshJwtConfiguration.secret,
      ignoreExpiration: false,
    });
  }

  validate(payload: AuthJwtPayload) {
    return { id: payload.sub };
  }
}
