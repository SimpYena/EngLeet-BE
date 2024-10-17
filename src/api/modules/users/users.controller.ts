import { Controller, Post, Body, UsePipes, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { LoginDTO } from './dto/login.dto';
import { TokenDTO } from './dto/token.dto';

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
}
