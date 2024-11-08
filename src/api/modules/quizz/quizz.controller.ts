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
import { ReadingQuizzDTO } from './dto/reading-quizz.dto';
import { QuizzService } from './quizz.service';
import { ListeningQuizzDTO } from './dto/listening-quizz.dto';
import { SearchParamsDTO } from './dto/search-params.dto';
import { PaginationOptionsDTO } from 'src/api/common/dto/pagination-options.dto';
import { GetID } from 'src/api/common/decorator/get-id.decorator';
import { JwtGuard } from '../users/guards/jwt-auth.guard';

@Controller('quizz')
export class QuizzController {
  constructor(private readonly quizzService: QuizzService) {}

  @Post('create/reading')
  @HttpCode(HttpStatus.CREATED)
  async createReadingQuizz(@Body() readingQuizz: ReadingQuizzDTO) {
    return this.quizzService.createReadingQuizz(readingQuizz);
  }

  @Post('create/listening')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('audio'))
  async createListeningQuizz(
    @UploadedFile() file: Express.Multer.File,
    @Body() listeningQuizz: ListeningQuizzDTO,
  ) {
    return this.quizzService.createListeningQuizz(file, listeningQuizz);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getQuizz(
    @Query() searchParamsDTO: SearchParamsDTO,
    @Query() paginationOptionsDTO: PaginationOptionsDTO
  ){
    return this.quizzService.searchQuizz(
        searchParamsDTO,
        paginationOptionsDTO
    )
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getQuizzById(@GetID('id') id: number){
    return this.quizzService.getQuizzDetails(id);
  }

  @UseGuards(JwtGuard)
  @Post(':id')
  @HttpCode(HttpStatus.OK)
  async submitQuizz(@GetID('id') id: number, @Req() req, @Body() answer){
    return this.quizzService.submitQuizz(id, req.user, answer);
  }
}
