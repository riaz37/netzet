import {
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateBookDto } from '@/books/dto/create-book.dto';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @ApiPropertyOptional({
    description: 'Title of the book',
    example: 'The Great Gatsby',
    minLength: 1,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({
    description: 'ISBN number of the book (ISBN-10 or ISBN-13)',
    example: '978-0-7432-7356-5',
    pattern: '^(\\d{13}|\\d{3}-\\d{1}-\\d{2}-\\d{5}-\\d{1}|\\d{3}-\\d{10})$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\d{13}|\d{3}-\d{1}-\d{2}-\d{5}-\d{1}|\d{3}-\d{10})$/i, {
    message: 'isbn must be a valid ISBN-10 or ISBN-13 format',
  })
  isbn?: string;

  @ApiPropertyOptional({
    description: 'Date when the book was published',
    example: '1925-04-10',
  })
  @IsOptional()
  @IsDateString()
  publishedDate?: string;

  @ApiPropertyOptional({
    description: 'Genre of the book',
    example: 'Fiction',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  genre?: string;

  @ApiPropertyOptional({
    description: 'UUID of the author',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  authorId?: string;
}
