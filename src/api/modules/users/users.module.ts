import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from 'src/api/common/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AccessToken } from 'src/api/common/entities/access-token.entity';
import { RefreshToken } from 'src/api/common/entities/refresh-token.entity';
import { JwtStrategy } from '../strategies/jwt-strategy';
import { RefreshTokenJwtStrategy } from '../strategies/refresh-token-jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([User, AccessToken, RefreshToken]),
  JwtModule.register({})
],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService,
    JwtStrategy,
    RefreshTokenJwtStrategy
  ],
})
export class UsersModule {}
