import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestController } from './test.controller';
import { S3Client } from '@aws-sdk/client-s3';
import { S3Config } from 'src/config/s3.config';
import { Test } from 'src/api/common/entities/test.entity';
import { Section } from 'src/api/common/entities/section.entity';
import { SectionContext } from 'src/api/common/entities/section-context.entity';
import { TestQuestion } from 'src/api/common/entities/test-question.entity';
import { TestService } from './test.service';
import { TestCategory } from 'src/api/common/entities/test-category.entity';
import { TestSubmitted } from 'src/api/common/entities/test-submitted.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Test, Section, SectionContext, TestQuestion, TestCategory, TestSubmitted])],
  controllers: [TestController],
  providers: [
    TestService,
    {
      provide: 'S3_CLIENT',
      useFactory: () =>{
        const s3ClientConfig =  S3Config();
        return new S3Client(s3ClientConfig);
      } 
      
    },
  ],
})
export class TestModule {}
