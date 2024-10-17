import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ErrorDetailDTO {
  @Expose()
  readonly error_id: string;

  @Expose()
  readonly field: string;

  @Expose()
  readonly title: string;

  @Expose()
  readonly message: string;
}
