import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TokenDTO {
  @Expose()
  access_token: string;

  @Expose()
  refresh_token: string;

  @Expose()
  expires_at: Date;
}
