import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
class AnswerViewDTO {
  @Expose()
  id: number;

  @Expose()
  question: string;

  @Expose()
  answer: string[];
}

@Exclude()
class SectionContextViewDTO {
  @Expose()
  id: number;

  @Expose()
  passage: string;

  @Expose()
  @Type(() => AnswerViewDTO)
  question: AnswerViewDTO[];
}

@Exclude()
export class ReadingViewDTO {
  @Expose()
  @Type(() => SectionContextViewDTO)
  sectionContext: SectionContextViewDTO[];
}
