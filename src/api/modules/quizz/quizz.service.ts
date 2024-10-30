import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ListeningQuizz } from 'src/api/common/entities/listening-quizz.entity';
import { ReadingQuizz } from 'src/api/common/entities/reading-quizz.entity';
import { Repository } from 'typeorm';
import { ReadingQuizzDTO } from './dto/reading-quizz.dto';
import { plainToInstance } from 'class-transformer';
import { ListeningQuizzDTO } from './dto/listening-quizz.dto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { PaginationOptionsDTO } from 'src/api/common/dto/pagination-options.dto';
import { PaginationDTO } from 'src/api/common/dto/pagination.dto';

@Injectable()
export class QuizzService {
  constructor(
    @InjectRepository(ReadingQuizz)
    private readonly readingQuizzRepository: Repository<ReadingQuizz>,
    @InjectRepository(ListeningQuizz)
    private readonly listeningQuizzRepository: Repository<ListeningQuizz>,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) {}

  async createReadingQuizz(readingQuizz: ReadingQuizzDTO) {
    const quizz = plainToInstance(ReadingQuizz, readingQuizz);

    await this.readingQuizzRepository.save(quizz);
  }

  async createListeningQuizz(
    file: Express.Multer.File,
    listeningQuizz: ListeningQuizzDTO,
  ) {
    if (!file) {
      throw new BadRequestException('SYS-0001');
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

    const s3Url = `${process.env.S3_BASE_URL}/${bucketName}/${fileKey}`;

    const saveQuizz = plainToInstance(ListeningQuizz, {
      ...listeningQuizz,
      audio_link: s3Url,
    });

    await this.listeningQuizzRepository.save(saveQuizz);
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
