import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ErrorDetailDTO } from './error-detail.dto';

@Exclude()
export class ErrorDTO {
  @Expose()
  readonly error_id: string;

  @Expose()
  readonly title: string;

  @Expose()
  readonly message: string;

  @Expose()
  @Type(() => ErrorDetailDTO)
  @Transform((value) => [])
  errors: ErrorDetailDTO[];
}
