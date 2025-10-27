import { IsString, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class BooksQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsUUID()
  authorId?: string;
}
