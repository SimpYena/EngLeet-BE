import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzController } from './quizz.controller';
import { QuizzService } from './quizz.service';
import { S3Client } from '@aws-sdk/client-s3';
import { S3Config } from 'src/config/s3.config';
import { Quizz } from 'src/api/common/entities/quizz.entity';
import { QuizzSubmitted } from 'src/api/common/entities/quizz-submitted.entity';
import { Review } from 'src/api/common/entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quizz, QuizzSubmitted, Review])],
  controllers: [QuizzController],
  providers: [
    QuizzService,
    {
      provide: 'S3_CLIENT',
      useFactory: () =>{
        const s3ClientConfig =  S3Config();
        return new S3Client(s3ClientConfig);
      } 
      
    },
  ],
})
export class QuizzModule {}
