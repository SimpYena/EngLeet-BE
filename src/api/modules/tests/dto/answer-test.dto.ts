import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';

export class AnswerTestDTO {
  @IsInt()
  question_id: number;

  @IsString()
  answer: string;
}

export class AnswerListDTO {
  @ValidateNested({ each: true })
  @Type(() => AnswerTestDTO)
  answers: AnswerTestDTO[];
}
