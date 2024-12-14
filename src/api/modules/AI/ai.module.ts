import Groq from 'groq-sdk';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Module } from '@nestjs/common';
import { S3Config } from 'src/config/s3.config';
import { S3Client } from '@aws-sdk/client-s3';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentTest } from 'src/api/common/entities/assessment-test.entity';
import { GeneratedTest } from 'src/api/common/entities/generated-test.entity';


@Module({
  imports: [TypeOrmModule.forFeature([AssessmentTest, GeneratedTest])],
  controllers: [AiController],
  providers: [AiService, Groq,
    {
      provide: 'S3_CLIENT', 
      useFactory: () =>{
        const s3ClientConfig =  S3Config();
        return new S3Client(s3ClientConfig);
      } 
      
    },
  ],
})
export class AiModule {}
