import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TestDetailsDTO {
  @Expose()
  title: string;

  @Expose()
  duration: string;

  @Expose()
  skill: string;

  @Expose()
  difficulty: string;

  @Expose()
  description: string;

  @Expose()
  image_url: string;
}
