import {
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @IsString()
  @Matches(/^(\d{13}|\d{3}-\d{1}-\d{2}-\d{5}-\d{1}|\d{3}-\d{10})$/i, {
    message: 'isbn must be a valid ISBN-10 or ISBN-13 format',
  })
  isbn: string;

  @IsOptional()
  @IsDateString()
  publishedDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  genre?: string;

  @IsUUID()
  authorId: string;
}
