import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy } from 'passport-jwt';
import { RefreshToken } from 'src/api/common/entities/refresh-token.entity';

import { RefreshJwtStrategyConfig } from 'src/config/auth.config';
import { Repository } from 'typeorm';

export class RefreshTokenJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh',
) {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {
    super(RefreshJwtStrategyConfig);
  }

  async validate(payload: any) {
    const { refreshTokenId } = payload;

    const refreshToken = await this.refreshTokenRepository.findOneBy({
      id: refreshTokenId,
    });

    if (!refreshToken) {
      throw new UnauthorizedException('SYS-0004');
    }

    if (refreshToken.expires_at < new Date(Date.now())) {
      throw new UnauthorizedException('SYS-0005');
    }

    return payload;
  }
}
