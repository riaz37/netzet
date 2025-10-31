import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { AuthorsService } from '@/authors/authors.service';
import { CreateAuthorDto } from '@/authors/dto/create-author.dto';
import { UpdateAuthorDto } from '@/authors/dto/update-author.dto';
import { AuthorsQueryDto } from '@/authors/dto/authors-query.dto';

@ApiTags('authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new author' })
  @ApiCreatedResponse({ description: 'Author successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorsService.create(createAuthorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all authors with pagination and search' })
  @ApiOkResponse({ description: 'List of authors retrieved successfully' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
  })
  findAll(@Query() query: AuthorsQueryDto) {
    return this.authorsService.findAll(
      query.page || 1,
      query.limit || 10,
      query.search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an author by ID' })
  @ApiParam({ name: 'id', description: 'Author ID' })
  @ApiOkResponse({ description: 'Author retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  findOne(@Param('id') id: string) {
    return this.authorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an author' })
  @ApiParam({ name: 'id', description: 'Author ID' })
  @ApiOkResponse({ description: 'Author updated successfully' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto) {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an author' })
  @ApiParam({ name: 'id', description: 'Author ID' })
  @ApiNoContentResponse({ description: 'Author deleted successfully' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  remove(@Param('id') id: string) {
    return this.authorsService.remove(id);
  }
}
