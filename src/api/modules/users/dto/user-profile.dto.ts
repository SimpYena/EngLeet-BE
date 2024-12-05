import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';


@Exclude()
export class UserProfileDTO {
  @Expose()
  @IsString({ message: 'AUTH-0001' })
  full_name: string;

  @Expose()
  image_link: string;
}
