import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Inject,
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
import {
  AccessTokenConfig,
  ForgotTokenConfig,
  RefreshTokenConfig,
  VerifyTokenConfig,
} from 'src/config/auth.config';
import { AccessToken } from 'src/api/common/entities/access-token.entity';
import { RefreshToken } from 'src/api/common/entities/refresh-token.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UserProfileDTO } from './dto/user-profile.dto';
import { v4 as uuid } from 'uuid';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private dataSource: DataSource,
    private jwtServices: JwtService,
    @InjectQueue('send-mail')
    private sendMailQueue: Queue,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) {}

  async register(createUserDTO: CreateUserDto) {
    const user = plainToInstance(User, createUserDTO);
    user.hashed_password = await bcrypt.hash(createUserDTO.password, 10);

    const existUser = await this.userRepository.findOne({
      where: { email: createUserDTO.email },
    });

    if (existUser) {
      throw new BadRequestException('AUTH-0005');
    }

    const newUser = await this.userRepository.save(user);

    return await this.sendMail(
      newUser.id,
      createUserDTO.email,
      createUserDTO.full_name,
    );
  }
  async login(loginDTO: LoginDTO) {
    const user = await this.userRepository.findOneBy({
      email: loginDTO.email,
      is_verified: true,
    });

    if (!user) {
      throw new BadRequestException('AUTH-0002');
    }

    if (!(await bcrypt.compare(loginDTO.password, user.hashed_password))) {
      throw new BadRequestException('AUTH-0002');
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
      Date.now() + parseFloat(AccessTokenConfig.expiresIn),
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
  async handleRefreshToken(payload: any) {
    const user = await this.userRepository.findOneBy({ id: payload.userId });

    if (!user) {
      throw new NotFoundException('SYS-0003');
    }

    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { id: payload.refreshTokenId },
      relations: ['access_token', 'access_token.user'],
    });

    if (!refreshToken) {
      throw new UnauthorizedException('SYS-0004');
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

      await this.revokeTokens(
        refreshToken.access_token.id,
        refreshToken.id,
        queryRunner,
      );

      await queryRunner.commitTransaction();

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
  async updateLastLogin(userId: number, queryRunner: QueryRunner) {
    await queryRunner.manager.update(User, userId, {
      last_login: new Date(Date.now()),
    });
  }
  async revokeTokens(
    accessTokenId: number,
    refreshTokenId: number,
    queryRunner: QueryRunner,
  ) {
    await queryRunner.manager.delete(RefreshToken, {
      id: refreshTokenId,
    });

    await queryRunner.manager.delete(AccessToken, {
      id: accessTokenId,
    });
  }
  async sendMail(userId: number, email: string, full_name: string) {
    const payload = { id: userId };

    const verifyToken = await this.jwtServices.signAsync(
      payload,
      VerifyTokenConfig,
    );

    const mailURL = process.env.MAIL_URL;

    await this.sendMailQueue.add('register', {
      to: email,
      name: full_name,
      verifyToken,
      mailURL,
    });
  }
  async verifyEmail(token: string): Promise<void> {
    try {
      const payload = await this.jwtServices.verifyAsync(
        token,
        VerifyTokenConfig,
      );

      await this.userRepository.update(
        { id: payload.id },
        { is_verified: true },
      );
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('AUTH-0010');
      }
      throw new UnauthorizedException('AUTH-0009');
    }
  }

  async logout(payload: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const refreshToken = await this.refreshTokenRepository.findOne({
        where: { access_token: { id: payload.accessTokenId } },
        relations: ['access_token', 'access_token.user'],
      });

      await this.revokeTokens(
        refreshToken.access_token.id,
        refreshToken.id,
        queryRunner,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getCurrentUser(user: any): Promise<User> {
    const currentUser = await this.userRepository.findOne({
      where: { id: user.userId },
    });

    if (!currentUser) {
      throw new UnauthorizedException('SYS-0001');
    }

    return currentUser;
  }
  async updateProfile(
    user: any,
    userProfileDTO: UserProfileDTO,
    file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        await this.userRepository.update({ id: user.userId }, {full_name: userProfileDTO.full_name});
        return;
      }
      const fileKey = uuid();
      const bucketName = process.env.S3_IMAGE_BUCKET;
  
      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
          Body: file.buffer,
          ACL: 'public-read',
        }),
      );
  
      const s3Url = `${process.env.S3_BASE_URL}/${fileKey}`;
  
      await this.userRepository.update({id: user.userId}, {full_name: userProfileDTO.full_name, image_link: s3Url})
    } catch (error) {
      console.log(error);
      
    }

  }
  async forgotPassword(forgotPasswordDTO: ForgotPasswordDTO){
    const existUser = await this.userRepository.findOneBy({email: forgotPasswordDTO.email})

    if(!existUser){
      throw new BadRequestException('SYS-0007')
    }

    const payload = { id: existUser.id };

    const forgotToken = await this.jwtServices.signAsync(
      payload,
      ForgotTokenConfig,
    );

    const mailURL = process.env.FORGOT_PASSWORD_URL;

    await this.sendMailQueue.add('forgot-password', {
      to: existUser.email,
      forgotToken,
      mailURL,
    });
  }
  async resetPassword(token: string, resetPasswordDTO: ResetPasswordDTO){
    try {
      const payload = await this.jwtServices.verifyAsync(
        token,
        ForgotTokenConfig,
      );

      const hashedPassword = await bcrypt.hash(resetPasswordDTO.password, 10)

      await this.userRepository.update(
        { id: payload.id },
        { hashed_password: hashedPassword},
      );
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('AUTH-0010');
      }
      throw new UnauthorizedException('AUTH-0009');
    }
  }
}
