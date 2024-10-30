import { Exclude, Expose, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';
import { Difficulty } from 'src/api/common/enum/difficulty.enum';

@Exclude()
export class ListeningQuizzDTO {
  @IsString()
  @Expose()
  title: string;

  @IsNumber()
  @Type(() => Number)
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
  @Type(() => Number)   
  @Expose()
  score: number;

  @IsNumber()
  @Type(() => Number)
  @Expose()
  acceptance: number;

  @Expose()
  audio_link: string;
}
