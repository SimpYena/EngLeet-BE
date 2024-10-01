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

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const { email, hashed_password, full_name, gender } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng.');
    }

    const hashedPassword = await bcrypt.hash(hashed_password, 10);
    const user = this.userRepository.create({
      email,
      full_name,
      gender,
      hashed_password: hashedPassword,
    });

    await this.userRepository.save(user);

    return { message: 'Đăng ký người dùng thành công.'  };
  }

  findAll() {
    return ;
  }

  findOne(id: number) {
    return ;
  }

  update(id: number) {
    return ;
  }

  remove(id: number) {
    return ;
  }
}
