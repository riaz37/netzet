import {
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({
    description: 'First name of the author',
    example: 'F. Scott',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    description: 'Last name of the author',
    example: 'Fitzgerald',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Biography of the author',
    example:
      'Francis Scott Key Fitzgerald was an American novelist, essayist, and short story writer.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({
    description: 'Birth date of the author',
    example: '1896-09-24',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;
}
