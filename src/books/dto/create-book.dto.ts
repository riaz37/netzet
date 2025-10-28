import {
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISBN } from '../../common/validators/isbn.validator';

export class CreateBookDto {
  @ApiProperty({
    description: 'Title of the book',
    example: 'The Great Gatsby',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiProperty({
    description: 'ISBN number of the book (ISBN-10 or ISBN-13)',
    example: '978-0-7432-7356-5',
  })
  @IsString()
  @IsISBN()
  isbn: string;

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

  @ApiProperty({
    description: 'UUID of the author',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  authorId: string;
}
