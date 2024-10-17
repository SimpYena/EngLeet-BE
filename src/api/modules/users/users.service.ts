import { 
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm/repository/Repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/api/common/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { LoginDTO } from './dto/login.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenConfig, RefreshTokenConfig } from 'src/config/auth.config';
import { AccessToken } from 'src/api/common/entities/access-token.entity';
import { RefreshToken } from 'src/api/common/entities/refresh-token.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
    private jwtServices: JwtService
  ) {}

  async register(createUserDTO: CreateUserDto) {
    const user = plainToInstance(User, createUserDTO);
    user.hashed_password = await bcrypt.hash(createUserDTO.password, 10);

    const existUser = await this.userRepository.findOne({
      where: { email: createUserDTO.email },
    });

    if (existUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    await this.userRepository.save(user);
  }
  async login(loginDTO: LoginDTO) {
    const user = await this.userRepository.findOneBy({ email: loginDTO.email, is_verified: true });

    if (!user) {
      throw new BadRequestException('Sai tài khoản hoặc mật khẩu');
    }

    if (!(await bcrypt.compare(loginDTO.password, user.hashed_password))) {
      throw new BadRequestException('Sai tài khoản hoặc mật khẩu');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { accessTokenSaved, refreshTokenSaved } = await this.saveTokens(
        user,
        queryRunner,
      );

      const { jwtAccessToken, jwtRefreshToken } = await this.generateTokens(
        user,
        accessTokenSaved,
        refreshTokenSaved,
      );

      await this.updateLastLogin(user.id, queryRunner);

      await queryRunner.commitTransaction();

      console.log(accessTokenSaved.expires_at.toLocaleString());
      

      return {
        access_token: jwtAccessToken,
        refresh_token: jwtRefreshToken,
        expires_at: accessTokenSaved.expires_at.toLocaleString(),
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  async saveTokens(user: User, queryRunner: QueryRunner) {
    const expiresAt = new Date(
      Date.now() + parseFloat(AccessTokenConfig.expiresIn)
    );

    const accessTokenSaved = await queryRunner.manager.save(AccessToken, {
      expires_at: expiresAt,
      user,
    });

    const refreshTokenSaved = await queryRunner.manager.save(RefreshToken, {
      access_token: accessTokenSaved,
      expires_at: new Date(
        Date.now() + parseFloat(RefreshTokenConfig.expiresIn),
      ),
    });

    return { accessTokenSaved, refreshTokenSaved };
  }
  async generateTokens(
    user: User,
    accessTokenSaved: AccessToken,
    refreshTokenSaved: RefreshToken,
  ) {
    const jwtAccessToken = await this.jwtServices.signAsync(
      {
        accessTokenId: accessTokenSaved.id,
        userId: user.id,
      },
      AccessTokenConfig,
    );

    const jwtRefreshToken = await this.jwtServices.signAsync(
      {
        refreshTokenId: refreshTokenSaved.id,
        accessTokenId: accessTokenSaved.id,
        userId: user.id,
      },
      RefreshTokenConfig,
    );

    return { jwtAccessToken, jwtRefreshToken };
  }
  async updateLastLogin(userId: number, queryRunner: QueryRunner) {
    await queryRunner.manager.update(User, userId, {
      last_login: new Date(Date.now()),
    });
  }
}
