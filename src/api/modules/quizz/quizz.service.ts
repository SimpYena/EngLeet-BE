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
import { QuizzSubmitted } from 'src/api/common/entities/quizz-submitted.entity';
import { ReviewDTO } from './dto/review.dto';
import { Review } from 'src/api/common/entities/review.entity';
import { ViewReviewDTO } from './dto/view-review.dto';
import { LeaderBoardDTO } from './dto/leaderboard.dto';
import { User } from 'src/api/common/entities/user.entity';
import { RecommendQuizzDTO } from './dto/recommend-quizz.dto';

@Injectable()
export class QuizzService {
  constructor(
    @InjectRepository(Quizz)
    private readonly quizzRepository: Repository<Quizz>,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
    @InjectRepository(QuizzSubmitted)
    private readonly quizzSubmittedRepository: Repository<QuizzSubmitted>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

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
    user: any,
  ) {
    try {
      const queryBuilder = this.quizzRepository.createQueryBuilder('quizz');

      queryBuilder
        .innerJoinAndSelect('quizz.topic', 'topic')
        .leftJoin(
          'quizz.quizzSubmit',
          'quizz_submitted',
          'quizz_submitted.user_id = :userId',
          { userId: user.userId },
        )
        .addSelect(
          `CASE WHEN quizz_submitted.user_id IS NOT NULL THEN 1 ELSE 0 END`,
          'status',
        );

      if (searchParamsDTO.keyword) {
        queryBuilder.andWhere('quizz.title LIKE :keyword', {
          keyword: `%${searchParamsDTO.keyword.trim()}%`,
        });
      }

      this.addFilter(queryBuilder, searchParamsDTO);

      const { entities: quizzes, raw } = await queryBuilder
        .offset(paginationOptionsDTO.offset)
        .limit(paginationOptionsDTO.limit)
        .getRawAndEntities();

      quizzes.forEach((quiz: any, index) => {
        const rawQuiz = raw[index];
        quiz.status = rawQuiz.status;
      });

      const total = await queryBuilder.getCount();

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

  parseQuizzOverall(quizz: Quizz) {
    return {
      id: quizz.id,
      title: quizz.title,
    };
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

    const previousQuizz = await this.quizzRepository
      .createQueryBuilder('quizz')
      .where('quizz.id < :id', { id })
      .orderBy('quizz.id', 'DESC')
      .getOne();

    const nextQuizz = await this.quizzRepository
      .createQueryBuilder('quizz')
      .where('quizz.id > :id', { id })
      .orderBy('quizz.id', 'ASC')
      .getOne();

    return {
      ...plainToInstance(QuizzDetailDTO, {
        ...quizz,
        audio_link: quizz.audio_link,
        nextQuizz: nextQuizz ? this.parseQuizzOverall(nextQuizz) : null,
        previousQuizz: previousQuizz ? this.parseQuizzOverall(previousQuizz) : null,
      }),
    };
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
  async submitQuizz(id: any, user: any, answer: any) {
    const quizz = await this.quizzRepository.findOneBy({
      id: id,
    });

    if (!quizz) {
      throw new BadRequestException();
    }

    const submittedQuizz = await this.quizzSubmittedRepository.findOneBy({
      quizz: { id: id },
      user: { id: user.userId },
    });

    if (submittedQuizz) {
      return await this.updateQuizzSubmit(
        answer.answer,
        quizz.correct_answer,
        submittedQuizz.id,
        quizz.score,
        submittedQuizz.attempt,
      );
    }

    return await this.saveQuizzSubmit(
      answer.answer,
      quizz.correct_answer,
      user.userId,
      quizz.id,
      quizz.score,
    );
  }
  async updateQuizzSubmit(
    answer: string,
    correctAnswer: string,
    quizzId: number,
    score: number,
    attempt: number,
  ) {
    if (answer === correctAnswer) {
      await this.quizzSubmittedRepository.update(
        { id: quizzId },
        {
          attempt: attempt + 1,
          score: score,
        },
      );

      return {
        status: 'Correct',
        score: score,
        attempt: attempt + 1,
      };
    }
    await this.quizzSubmittedRepository.update(
      { id: quizzId },
      {
        attempt: attempt + 1,
      },
    );

    return {
      status: 'Incorrect',
      score: 0,
      attempt: attempt + 1,
    };
  }
  async saveQuizzSubmit(
    answer: string,
    correctAnswer: string,
    userId: number,
    quizzId: number,
    score: number,
  ) {
    let attempt = 0;
    if (answer === correctAnswer) {
      await this.quizzSubmittedRepository.save({
        attempt: attempt + 1,
        user: { id: userId },
        quizz: { id: quizzId },
        score,
      });
      return {
        status: 'Correct',
        score: score,
        attempt: attempt + 1,
      };
    }
    await this.quizzSubmittedRepository.save({
      attempt: attempt + 1,
      user: { id: userId },
      quizz: { id: quizzId },
      score: 0,
    });
    return {
      status: 'Incorrect',
      score: 0,
      attempt: attempt + 1,
    };
  }
  async comment(id: number, user: any, review: ReviewDTO) {
    const quizz = await this.quizzRepository.findOneBy({ id: id });

    if (!quizz) {
      throw new BadRequestException('BAD-0001')
    }

    await this.reviewRepository.save({
      quizz: { id: id },
      user: { id: user.userId },
      description: review.description
    })
  }
  async getComment(id: number, user: any) {
    try {

      const reviews = await this.reviewRepository.createQueryBuilder('review')
        .innerJoinAndSelect('review.user', 'user')
        .innerJoinAndSelect('review.quizz', 'quizz')
        .where('review.quizz_id = :id', { id })
        .getMany()
      console.log(reviews);


      return reviews.map((review) => ({
        id: review.id,
        description: review.description,
        user: {
          full_name: review.user.full_name,
          image_url: review.user.image_link,
        }
      }));

    } catch (error) {
      console.log(error);

    }
  }
  async getLeaderboard(paginationOptionsDTO: PaginationOptionsDTO) {
    try {
      const queryBuilder = this.quizzSubmittedRepository.createQueryBuilder('quizz_submitted')
      queryBuilder.select('quizz_submitted.user_id', 'user_id')
        .addSelect('user.full_name', 'full_name')
        .addSelect('user.image_link', 'image_link')
        .addSelect('SUM(quizz_submitted.score)', 'totalScore')
        .addSelect('COUNT(DISTINCT quizz_submitted.quizz_id)', 'totalQuizzes')
        .addSelect('MAX(quizz_submitted.attempt)', 'maxAttempt')
        .innerJoin('users', 'user', 'user.id = quizz_submitted.user_id')
        .groupBy('quizz_submitted.user_id')
        .orderBy('SUM(quizz_submitted.score)', 'DESC')
        .addOrderBy('COUNT(DISTINCT quizz_submitted.quizz_id)', 'DESC')
        .addOrderBy('MAX(quizz_submitted.attempt)', 'ASC')

      const result = await queryBuilder
        .offset(paginationOptionsDTO.offset)
        .limit(paginationOptionsDTO.limit)
        .getRawAndEntities();

      const { raw } = result;
      const pagination = this.getPagination(raw.length, paginationOptionsDTO);
      return { items: plainToInstance(LeaderBoardDTO, raw), pagination }

    } catch (error) {
      console.log(error);

    }

  }
  async getRecommendQuizz(user: any) {
    const existUser = await this.userRepository.findOneBy({ id: user.userId });
  
    if (!existUser.level) {
      throw new BadRequestException('User must complete an assessment test to get a level');
    }
  
    const queryBuilder = this.quizzRepository.createQueryBuilder('quizz');
  
    let difficulty: string;
  
    if (existUser.level === 1) {
      difficulty = 'Easy';
    } else if (existUser.level === 2 || existUser.level === 3) {
      difficulty = 'Medium';
    } else if (existUser.level === 4 || existUser.level === 5) {
      difficulty = 'Hard';
    } else {
      throw new BadRequestException('Invalid user level');
    }
  
    const recommendedQuizzes = await queryBuilder
      .leftJoin(
        'quizz.quizzSubmit',
        'quizz_submitted',
        'quizz_submitted.user_id = :userId',
        { userId: user.userId },
      )
      .where('quizz.difficulty = :difficulty', { difficulty })
      .andWhere('quizz_submitted.id IS NULL')
      .getOne();
  
    return plainToInstance(RecommendQuizzDTO,recommendedQuizzes);
  }
  
}
