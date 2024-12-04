import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { TestOptionDTO } from './dto/test-option.dto';
import { AiService } from './ai.service';
import { JwtGuard } from '../users/guards/jwt-auth.guard';
import { AwnswerDTO } from './dto/answer.dto';

@Controller('generate')
export class AiController {
    constructor(
        private readonly aiService: AiService
    ){}

    @Post('reading')
    async generateReadingSection(@Body() testOptionDTO: TestOptionDTO) {
        return this.aiService.generateReadingSection(testOptionDTO);
    }
    
    @Post('listening')
    async generateListeningSection(@Body() testOptionDTO: TestOptionDTO){
        return this.aiService.generateListeningSection(testOptionDTO);
    }
    @UseGuards(JwtGuard)
    @Get('assessment')
    async generateAssessmentTest(@Req() req) {
        return this.aiService.generateAssessmentTest(req.user);
    }
    
    @UseGuards(JwtGuard)
    @Post('submit')
    async submitAssessment(@Req() req, @Body() answerDTO: AwnswerDTO) {
        return this.aiService.submitAssessment(req.user, answerDTO);
    }
}
