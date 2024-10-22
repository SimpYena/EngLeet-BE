import { UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtStrategyConfig } from 'src/config/auth.config';
import { Repository } from 'typeorm';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { AccessToken } from 'src/api/common/entities/access-token.entity';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(AccessToken)
    private readonly accessTokenRepository: Repository<AccessToken>,
  ) {
    super(JwtStrategyConfig);
  }

  async validate(payload: any) {
    const { accessTokenId } = payload;

    const accessToken = await this.accessTokenRepository.findOneBy({
      id: accessTokenId,
    });

    if (!accessToken) {
      throw new UnauthorizedException('SYS-0004');
    }

    if (accessToken.expires_at < new Date(Date.now())) {
      throw new UnauthorizedException('SYS-0005');
    }

    return payload;
  }
}
