import { Controller, Post, Body, UsePipes, ValidationPipe, HttpCode, HttpStatus, UseGuards, Request, Param, Patch, Delete, Get, Req, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { LoginDTO } from './dto/login.dto';
import { TokenDTO } from './dto/token.dto';
import { RefreshTokenJwtGuard } from './guards/refresh-token-auth.guard';
import { JwtGuard } from './guards/jwt-auth.guard';
import { ViewUserDTO } from './dto/view-user.dto';
import { UserProfileDTO } from './dto/user-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto){
    await this.usersService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDTO: LoginDTO): Promise<TokenDTO> {
    return plainToInstance(TokenDTO, await this.usersService.login(loginDTO));
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenJwtGuard)
  async refreshToken(@Request() req): Promise<TokenDTO> {
    return plainToInstance(
      TokenDTO,
      await this.usersService.handleRefreshToken(req.user),
    );
  }

  @Patch('verify-email/:token')
  async verifyEmail(@Param('token') token: string){    
    await this.usersService.verifyEmail(token);
  }

  @UseGuards(JwtGuard)
  @Delete('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() req): Promise<void> {
    await this.usersService.logout(req.user);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Req() req): Promise<ViewUserDTO> {
    return plainToInstance(
      ViewUserDTO,
      await this.usersService.getCurrentUser(req.user),
    );
  }

  @UseGuards(JwtGuard)
  @Put('profile')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfile(@UploadedFile() file: Express.Multer.File, @Req() req, @Body() userProfileDTO: UserProfileDTO) {
    return this.usersService.updateProfile(req.user, userProfileDTO, file);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDTO: ForgotPasswordDTO){
    return this.usersService.forgotPassword(forgotPasswordDTO);
  }
  @Get('verifiy-reset-password/:token')
  async verifyResetPassword(@Param('token') token: string){
    return this.usersService.verifyResetPassword(token);
  }
  @Patch('update-password/:token')
  async resetPassword(@Param('token') token: string,@Body() resetPasswordDTO: ResetPasswordDTO){
    return this.usersService.resetPassword(token, resetPasswordDTO);
  }
}
