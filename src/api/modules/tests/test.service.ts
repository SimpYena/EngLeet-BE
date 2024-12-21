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
import { Repository, SelectQueryBuilder } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { SectionDTO } from './dto/section.dto';
import { Section } from 'src/api/common/entities/section.entity';
import { SectionContext } from 'src/api/common/entities/section-context.entity';
import { TestQuestion } from 'src/api/common/entities/test-question.entity';
import { TestDTO } from './dto/test.dto';
import { SectionContextDTO } from './dto/section-context.dto';
import { v4 as uuid } from 'uuid';
import { TestQuestionDTO } from './dto/test-question.dto';
import { TestFilterDTO } from './dto/test-filters.dto';
import { ViewTestDTO } from './dto/view-test.dto';
import { TestDetailsDTO } from './dto/test-details.dto';
import { ListeningViewDTO } from './dto/view-listening-test.dto';
import { ReadingViewDTO } from './dto/view-reading-test.dto';
import { AnswerListDTO } from './dto/answer-test.dto';
import { TestSubmitted } from 'src/api/common/entities/test-submitted.entity';
import { TestPreviewDTO } from './dto/test-preview.dto';

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
    @InjectRepository(TestSubmitted)
    private readonly testSubmittedRepository: Repository<TestSubmitted>,
  ) { }

  async addTest(testDTO: TestDTO, file: Express.Multer.File) {
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

    const s3Url = `${process.env.S3_IMAGE_URL}/${fileKey}`;
    const test = plainToInstance(Test, {
      ...testDTO,
      image_url: s3Url,
    });

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

  async searchTest(
    testFilterDTO: TestFilterDTO,
    paginationOptionsDTO: PaginationOptionsDTO,
  ) {
    try {
      const queryBuilder = this.testRepository.createQueryBuilder('test');

      queryBuilder.innerJoinAndSelect('test.category', 'category');

      this.addFilter(queryBuilder, testFilterDTO);

      const [tests, total] = await queryBuilder
        .offset(paginationOptionsDTO.offset)
        .limit(paginationOptionsDTO.limit)
        .getManyAndCount();

      const pagination = this.getPagination(total, paginationOptionsDTO);

      return { items: plainToInstance(ViewTestDTO, tests), pagination };
    } catch (error) {
      console.log(error);
    }
  }

  addFilter(
    queryBuilder: SelectQueryBuilder<Test>,
    testFilterDTO: TestFilterDTO,
  ) {
    if (testFilterDTO.category.length > 0) {
      queryBuilder.andWhere('category IN (:...categories)', {
        categories: testFilterDTO.category,
      });
    }
    if (testFilterDTO.difficulty.length > 0) {
      queryBuilder.andWhere('difficulty IN (:...difficulties)', {
        difficulties: testFilterDTO.difficulty,
      });
    }
  }

  async getTest(id: number) {
    const test = await this.testRepository.findOneBy({ id: id });

    return plainToInstance(TestDetailsDTO, {
      ...test,
      skill: 'Listening, Reading',
      duration: '45 minutes',
    });
  }

  async getListeningTest(id: number) {
    const queryBuilder = this.sectionRepository.createQueryBuilder('section');

    queryBuilder.innerJoinAndSelect(
      'section.sectionContext',
      'section_context',
    );

    queryBuilder.innerJoinAndSelect(
      'section_context.question',
      'test_question',
    );

    queryBuilder.andWhere('test_id = :test_id', {
      test_id: id,
    });

    queryBuilder.andWhere('type = :type', {
      type: 'Listening',
    });

    const listeningTest = await queryBuilder.getMany();

    return { items: plainToInstance(ListeningViewDTO, listeningTest) };
  }

  async getReadingTest(id: number) {
    const queryBuilder = this.sectionRepository.createQueryBuilder('section');

    queryBuilder.innerJoinAndSelect(
      'section.sectionContext',
      'section_context',
    );

    queryBuilder.innerJoinAndSelect(
      'section_context.question',
      'test_question',
    );

    queryBuilder.andWhere('test_id = :test_id', {
      test_id: id,
    });

    queryBuilder.andWhere('type = :type', {
      type: 'Reading',
    });

    const readingTest = await queryBuilder.getMany();

    return { items: plainToInstance(ReadingViewDTO, readingTest) };
  }

  async submitTest(id: number, answers: AnswerListDTO[], user: any) {
    try {
      const questionIds = answers.map((answer: any) => answer.question_id);
      console.log(id);
      const testQuestions =
        await this.testQuestionRepository.findByIds(questionIds);

      const validationResult: object = answers.map((answer: any) => {
        const question = testQuestions.find((q) => q.id === answer.question_id);
        if (!question) {
          return {
            question_id: answer.question_id,
            answer: answer.answer,
            status: 'Question not found',
          };
        }
        const isCorrect = question.correct_answer === answer.answer;
        return {
          question_id: answer.question_id,
          answer: answer.answer,
          correct_answer: question.correct_answer,
          status: isCorrect ? 'Correct' : 'Incorrect',
        };
      });

      await this.testSubmittedRepository.save({
        history: validationResult,
        user: { id: user.userId },
        test: { id: id },
      });
      return validationResult;
    } catch (error) {
      console.log(error);
    }
  }
  async getResult(id: number, user: any) {
    const test = await this.testRepository.findOneBy({ id: id });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    const testSubmitted = await this.testSubmittedRepository.findOneBy({
      test: { id: id },
      user: { id: user.userId },
    });

    if (!testSubmitted) {
      throw new BadRequestException('Test not submitted');
    }

    return testSubmitted.history;
  }
  async getRecentlyTest() {
    const queryBuilder = this.testRepository.createQueryBuilder('test');

    queryBuilder.orderBy('test.created_at').limit(4)

    queryBuilder.limit(4)
    const tests = await queryBuilder.getMany();

    return { items: plainToInstance(TestPreviewDTO, tests) };

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
