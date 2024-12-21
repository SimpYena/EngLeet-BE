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
import { ReviewDTO } from './dto/review.dto';

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

  @UseGuards(JwtGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getQuizz(
    @Query() searchParamsDTO: SearchParamsDTO,
    @Query() paginationOptionsDTO: PaginationOptionsDTO,
    @Req() req
  ){
    return this.quizzService.searchQuizz(
        searchParamsDTO,
        paginationOptionsDTO,
        req.user
    )
  }

  @UseGuards(JwtGuard)
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

  @UseGuards(JwtGuard)
  @Post(':id/review')
  @HttpCode(HttpStatus.OK)
  async comment(@GetID('id') id: number, @Req() req, @Body() review: ReviewDTO){
    return this.quizzService.comment(id, req.user, review);
  }
  
  @UseGuards(JwtGuard)
  @Get(':id/review')
  @HttpCode(HttpStatus.OK)
  async getComment(@GetID('id') id: number, @Req() req){
    return this.quizzService.getComment(id, req.user);
  }
  
  @UseGuards(JwtGuard)
  @Get('view/leaderboard')
  @HttpCode(HttpStatus.OK)
  async getLeaderboard(@Query() paginationOptionsDTO: PaginationOptionsDTO){
    return this.quizzService.getLeaderboard(paginationOptionsDTO);
  }

  @UseGuards(JwtGuard)
  @Get('recommend/view')
  @HttpCode(HttpStatus.OK)
  async getRecommendQuizz(@Req() req){
    return this.quizzService.getRecommendQuizz(req.user);
  }
}
