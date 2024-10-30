import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReadingQuizzDTO } from './dto/reading-quizz.dto';
import { QuizzService } from './quizz.service';
import { ListeningQuizzDTO } from './dto/listening-quizz.dto';

@Controller('quizz')
export class QuizzController {
  constructor(private readonly quizzService: QuizzService) {}

  @Post('create/reading')
  async createReadingQuizz(@Body() readingQuizz: ReadingQuizzDTO) {
    return this.quizzService.createReadingQuizz(readingQuizz);
  }

  @Post('create/listening')
  @UseInterceptors(FileInterceptor('audio'))
  async createListeningQuizz(
    @UploadedFile() file: Express.Multer.File,
    @Body() listeningQuizz: ListeningQuizzDTO,
  ) {
    return this.quizzService.createListeningQuizz(file, listeningQuizz);
  }
}
