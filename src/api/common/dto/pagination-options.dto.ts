import { Transform } from 'class-transformer';
import { IsArray, IsInt } from 'class-validator';

export class PaginationOptionsDTO {
  @Transform(({ value }) => (parseInt(value) >= 0 ? parseInt(value) : 0))
  @IsInt({ message: 'BAD-0001' })
  offset: number = 0;

  @Transform(({ value }) => (parseInt(value) >= 0 ? parseInt(value) : 20))
  @IsInt({ message: 'BAD-0001' })
  limit: number = 20;

  @Transform(({ value }) => (value ? value.split(',').map(String) : []))
  @IsArray()
  sorts: string[] = [];
}
