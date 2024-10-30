import { Exclude, Expose } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';
import { Difficulty } from 'src/api/common/enum/difficulty.enum';

@Exclude()
export class ReadingQuizzDTO {
  @IsString()
  @Expose()
  title: string;

  @IsNumber()
  @Expose()
  topic: number;

  @IsEnum(Difficulty)
  @Expose()
  difficulty: string;

  @IsString()
  @Expose()
  context: string;

  @IsArray()
  @Expose()
  answer: JSON;

  @IsString()
  @Expose()
  correct_answer: string;

  @IsNumber()
  @Expose()
  score: number;

  @IsNumber()
  @Expose()
  acceptance: number;
}
