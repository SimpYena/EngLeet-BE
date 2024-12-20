import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class QuizzDetailDTO {
  @Expose()
  id: number;

  @Expose()
  tilte: string;

  @Expose()
  acceptance: number;

  @Expose()
  context: string;

  @Expose()
  difficulty: string;

  @Expose()
  @Transform(({ value }) => value.topic)
  topic: string;

  @Expose()
  answer: JSON;

  @Expose()
  score: number;

  @Expose()
  audio_link: string;

  @Expose()
  previousQuizz: JSON;

  @Expose()
  nextQuizz: JSON;
}
