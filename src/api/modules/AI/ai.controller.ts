import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { TestOptionDTO } from './dto/test-option.dto';
import { AiService } from './ai.service';
import { JwtGuard } from '../users/guards/jwt-auth.guard';
import { AwnswerDTO } from './dto/answer.dto';
import { GetID } from 'src/api/common/decorator/get-id.decorator';
import { ChatDTO } from './dto/chat.dto';

@Controller('generate')
export class AiController {
    constructor(
        private readonly aiService: AiService
    ){}
    @UseGuards(JwtGuard)
    @Post('reading')
    async generateReadingSection(@Body() testOptionDTO: TestOptionDTO, @Req() req) {
        return this.aiService.generateReadingSection(testOptionDTO, req.user);
    }
    @UseGuards(JwtGuard)
    @Post('listening')
    async generateListeningSection(@Body() testOptionDTO: TestOptionDTO, @Req() req){
        return this.aiService.generateListeningSection(testOptionDTO, req.user);
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
    @UseGuards(JwtGuard)
    @Get('test')
    async getListTest(@Req() req){
        return this.aiService.getListTest(req.user);
    }
    @UseGuards(JwtGuard)
    @Get('test/:id')
    async getTest(@Req() req, @GetID('id') id: number) {
        return this.aiService.getTest(req.user, id);
    }
    @Post('chat')
    async chatwithAI(@Body() chatDTO: ChatDTO){
        return this.aiService.chatWithAI(chatDTO);
    }
}
