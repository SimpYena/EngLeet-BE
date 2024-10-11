import { 
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm/repository/Repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/api/common/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerUser(createUserDTO: CreateUserDto) {
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
}
