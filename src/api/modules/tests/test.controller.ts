import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationOptionsDTO } from 'src/api/common/dto/pagination-options.dto';
import { GetID } from 'src/api/common/decorator/get-id.decorator';
import { JwtGuard } from '../users/guards/jwt-auth.guard';
import { TestService } from './test.service';
import { SectionDTO } from './dto/section.dto';
import { TestQuestionDTO } from './dto/test-question.dto';
import { TestDTO } from './dto/test.dto';
import { SectionContextDTO } from './dto/section-context.dto';
import { TestFilterDTO } from './dto/test-filters.dto';
import { AnswerListDTO } from './dto/answer-test.dto';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  async addTest(@Body() testDTO: TestDTO, @UploadedFile() file: Express.Multer.File,) {
    return this.testService.addTest(testDTO, file);
  }

  @Post('section')
  @HttpCode(HttpStatus.CREATED)
  async addSection(@Body() sectionDTO: SectionDTO) {
    return this.testService.addSection(sectionDTO);
  }

  @UseInterceptors(FileInterceptor('audio'))
  @HttpCode(HttpStatus.CREATED)
  @Post('section-context')
  async addSectionContext(
    @Body() sectionContextDTO: SectionContextDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.testService.addContext(sectionContextDTO, file);
  }

  @Post('question')
  @HttpCode(HttpStatus.CREATED)
  async addQuestion(@Body() testQuestionDTO: TestQuestionDTO) {  
    return this.testService.addQuestion(testQuestionDTO);
  }

  @UseGuards(JwtGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async filterTest(
    @Query() testFilterDTO: TestFilterDTO,
    @Query() paginationOptionsDTO: PaginationOptionsDTO
  ){
    return this.testService.searchTest(
      testFilterDTO,
      paginationOptionsDTO
  )
  }
  @UseGuards(JwtGuard)
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getTestDetails(
    @GetID('id') id: number,
  ){
    return this.testService.getTest(id);
  }

  @UseGuards(JwtGuard)
  @Get('/:id/listening')
  @HttpCode(HttpStatus.OK)
  async getListeningTest(
    @GetID('id') id: number
  ){
    return this.testService.getListeningTest(id);
  }

  @UseGuards(JwtGuard)
  @Get('/:id/reading')
  @HttpCode(HttpStatus.OK)
  async getReadingTest(
    @GetID('id') id: number
  ){
    return this.testService.getReadingTest(id);
  }

  @UseGuards(JwtGuard)
  @Post('/:id/submit')
  @HttpCode(HttpStatus.CREATED)
  async submitTest(
    @GetID('id') id: number,
    @Body() answerListDTO: AnswerListDTO[],
    @Req() req: any
  ){
    return this.testService.submitTest(id, answerListDTO, req.user);
  }

  @UseGuards(JwtGuard)
  @Get('/:id/result')
  @HttpCode(HttpStatus.OK)
  async getResult(
    @GetID('id') id: number,
    @Req() req: any
  ){
    return this.testService.getResult(id, req.user);
  }

  @UseGuards(JwtGuard)
  @Get('view/recently')
  @HttpCode(HttpStatus.OK)
  async getRecentlyTest(){
    return this.testService.getRecentlyTest();
  }
}
