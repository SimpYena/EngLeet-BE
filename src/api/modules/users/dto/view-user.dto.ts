import { Exclude, Expose } from 'class-transformer';
import { Gender } from 'src/api/common/enum/gender.enum';

@Exclude()
export class ViewUserDTO {
  @Expose()
  id: number;

  @Expose()
  full_name: string;

  @Expose()
  gender: Gender;

  @Expose()
  email: string;

  @Expose()
  created_at: Date;

  @Expose()
  last_login: Date;

  @Expose()
  level: number;
}
