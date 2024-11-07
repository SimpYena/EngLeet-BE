import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ReadingQuizzDTO } from './dto/reading-quizz.dto';
import { plainToInstance } from 'class-transformer';
import { ListeningQuizzDTO } from './dto/listening-quizz.dto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { PaginationOptionsDTO } from 'src/api/common/dto/pagination-options.dto';
import { PaginationDTO } from 'src/api/common/dto/pagination.dto';
import { SearchParamsDTO } from './dto/search-params.dto';
import { ViewQuizzDTO } from './dto/view-quizz.dto';
import { Quizz } from 'src/api/common/entities/quizz.entity';
import { QuizzDetailDTO } from './dto/quizz-details.dto';

@Injectable()
export class QuizzService {
  constructor(
    @InjectRepository(Quizz)
    private readonly quizzRepository: Repository<Quizz>,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) {}

  async createReadingQuizz(readingQuizz: ReadingQuizzDTO) {
    if (readingQuizz.type !== 'Reading') {
      throw new BadRequestException('BAD-0001');
    }

    const quizz = plainToInstance(Quizz, readingQuizz);

    await this.quizzRepository.save(quizz);
  }

  async createListeningQuizz(
    file: Express.Multer.File,
    listeningQuizz: ListeningQuizzDTO,
  ) {
    if (listeningQuizz.type !== 'Listening') {
      throw new BadRequestException('BAD-0001');
    }

    if (!file) {
      throw new BadRequestException('SYS-0002');
    }

    const fileKey = uuid();
    const bucketName = process.env.S3_BUCKET;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: file.buffer,
        ACL: 'public-read',
      }),
    );

    const s3Url = `${process.env.S3_BASE_URL}/${fileKey}`;

    const saveQuizz = plainToInstance(Quizz, {
      ...listeningQuizz,
      audio_link: s3Url,
    });

    await this.quizzRepository.save(saveQuizz);
  }
  async searchQuizz(
    searchParamsDTO: SearchParamsDTO,
    paginationOptionsDTO: PaginationOptionsDTO,
  ) {
    try {
      const queryBuilder = this.quizzRepository.createQueryBuilder('quizz');

      queryBuilder.innerJoinAndSelect('quizz.topic', 'topic');

      if (searchParamsDTO.keyword) {
        queryBuilder.andWhere('quizz.title LIKE :keyword', {
          keyword: `%${searchParamsDTO.keyword.trim()}%`,
        });
      }

      this.addFilter(queryBuilder, searchParamsDTO);

      const [quizzes, total] = await queryBuilder
        .offset(paginationOptionsDTO.offset)
        .limit(paginationOptionsDTO.limit)
        .getManyAndCount();

      const pagination = this.getPagination(total, paginationOptionsDTO);

      return { items: plainToInstance(ViewQuizzDTO, quizzes), pagination };
    } catch (error) {
      console.log(error);
    }
  }

  addFilter(
    queryBuilder: SelectQueryBuilder<Quizz>,
    searchParamsDTO: SearchParamsDTO,
  ) {
    if (searchParamsDTO.skills.length > 0) {
      queryBuilder.andWhere('type IN (:...types)', {
        types: searchParamsDTO.skills,
      });
    }
    if (searchParamsDTO.difficulties.length > 0) {
      queryBuilder.andWhere('difficulty IN (:...difficulties)', {
        difficulties: searchParamsDTO.difficulties,
      });
    }
    if (searchParamsDTO.topics.length > 0) {
      queryBuilder.andWhere('topic IN (:...topics)', {
        topics: searchParamsDTO.topics,
      });
    }
  }
  async getQuizzDetails(id: number) {
    const queryBuilder = this.quizzRepository.createQueryBuilder('quizz');

    queryBuilder.innerJoinAndSelect('quizz.topic', 'topic');

    queryBuilder.andWhere('quizz.id = :id', { id });

    const quizz = await queryBuilder.getOne();

    if (!quizz) throw new NotFoundException('SYS-0003');

    if (quizz.type === 'Listening' && quizz.audio_link == null) {
      throw new NotFoundException('SYS-0003');
    }

    return plainToInstance(QuizzDetailDTO, {
      ...quizz,
      audio_link: quizz.audio_link,
    });
  }

  getPagination(
    total: number,
    paginationOptionsDTO: PaginationOptionsDTO,
  ): PaginationDTO {
    return {
      total,
      limit: paginationOptionsDTO.limit,
      offset: paginationOptionsDTO.offset,
    };
  }
}
