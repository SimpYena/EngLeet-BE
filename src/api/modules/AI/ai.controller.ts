import { Body, Controller, Post } from '@nestjs/common';
import { TestOptionDTO } from './dto/test-option.dto';
import { AiService } from './ai.service';

@Controller()
export class AiController {
    constructor(
        private readonly aiService: AiService
    ){}

    @Post('/generate/reading')
    async generateReadingSection(@Body() testOptionDTO: TestOptionDTO) {
        return this.aiService.generateReadingSection(testOptionDTO);
    }
    
    @Post('/generate/listening')
    async generateListeningSection(@Body() testOptionDTO: TestOptionDTO){
        return this.aiService.generateListeningSection(testOptionDTO);
    }
}
