import { Controller, Post, Body, UsePipes, ValidationPipe, HttpCode, HttpStatus, UseGuards, Request, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { LoginDTO } from './dto/login.dto';
import { TokenDTO } from './dto/token.dto';
import { RefreshTokenJwtGuard } from './guards/refresh-token-auth.guard';

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

}
