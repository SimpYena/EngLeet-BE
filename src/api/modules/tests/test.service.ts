import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptionsDTO } from 'src/api/common/dto/pagination-options.dto';
import { PaginationDTO } from 'src/api/common/dto/pagination.dto';
import { Test } from 'src/api/common/entities/test.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { SectionDTO } from './dto/section.dto';
import { Section } from 'src/api/common/entities/section.entity';
import { SectionContext } from 'src/api/common/entities/section-context.entity';
import { TestQuestion } from 'src/api/common/entities/test-question.entity';
import { TestDTO } from './dto/test.dto';
import { SectionContextDTO } from './dto/section-context.dto';
import { v4 as uuid } from 'uuid';
import { TestQuestionDTO } from './dto/test-question.dto';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(Test)
    private readonly testRepository: Repository<Test>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(SectionContext)
    private readonly sectionContextRepository: Repository<SectionContext>,
    @InjectRepository(TestQuestion)
    private readonly testQuestionRepository: Repository<TestQuestion>,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) {}

  async addTest(testDTO: TestDTO) {
    const test = plainToInstance(Test, testDTO);

    await this.testRepository.save(test);
  }

  async addSection(sectionDTO: SectionDTO) {
    const section = plainToInstance(Section, sectionDTO);

    await this.sectionRepository.save(section);
  }

  async addContext(
    sectionContextDTO: SectionContextDTO,
    file: Express.Multer.File,
  ) {
    if (!sectionContextDTO.passage) {
      const fileKey = uuid();
      const bucketName = process.env.S3_BUCKET;
      console.log(sectionContextDTO);

      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
          Body: file.buffer,
          ACL: 'public-read',
        }),
      );

      const s3Url = `${process.env.S3_BASE_URL}/${fileKey}`;

      const listeningContext = plainToInstance(SectionContext, {
        ...sectionContextDTO,
        audio_link: s3Url,
      });

      await this.sectionContextRepository.save(listeningContext);
    }
    const readingContext = plainToInstance(SectionContext, sectionContextDTO);

    await this.sectionContextRepository.save(readingContext);
  }

  async addQuestion(testQuestionDTO: TestQuestionDTO) {
    const question = plainToInstance(TestQuestion, testQuestionDTO);

    await this.testQuestionRepository.save(question);
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
