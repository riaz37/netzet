import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookDto } from '@/books/dto/create-book.dto';
import { UpdateBookDto } from '@/books/dto/update-book.dto';
import { Book } from '@/entities/book.entity';
import { Author } from '@/entities/author.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const author = await this.authorRepository.findOne({
      where: { id: createBookDto.authorId },
    });

    if (!author) {
      throw new BadRequestException(
        `Author with ID ${createBookDto.authorId} not found`,
      );
    }

    const existingBook = await this.bookRepository.findOne({
      where: { isbn: createBookDto.isbn },
    });

    if (existingBook) {
      throw new BadRequestException(
        `Book with ISBN ${createBookDto.isbn} already exists`,
      );
    }

    // TypeORM doesn't automatically populate relations on save, so we attach author manually
    const book = this.bookRepository.create({
      title: createBookDto.title,
      isbn: createBookDto.isbn,
      authorId: author.id,
      author: author,
      publishedDate: createBookDto.publishedDate
        ? new Date(createBookDto.publishedDate as unknown as string)
        : undefined,
      genre: createBookDto.genre,
    });

    let savedBook: Book;
    try {
      savedBook = await this.bookRepository.save(book);
    } catch (err) {
      throw new BadRequestException(
        typeof err?.message === 'string'
          ? err.message
          : 'Failed to create book',
      );
    }

    savedBook.author = author;

    return savedBook;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    authorId?: string,
  ): Promise<{ data: Book[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.author', 'author');

    if (search) {
      queryBuilder.where(
        '(book.title ILIKE :search OR book.isbn ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (authorId) {
      queryBuilder.andWhere('book.authorId = :authorId', { authorId });
    }

    queryBuilder.skip(skip).take(limit).orderBy('book.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    await this.findOne(id);

    if (updateBookDto.authorId) {
      const author = await this.authorRepository.findOne({
        where: { id: updateBookDto.authorId },
      });

      if (!author) {
        throw new BadRequestException(
          `Author with ID ${updateBookDto.authorId} not found`,
        );
      }
    }

    // Prevent ISBN conflicts with other books
    if (updateBookDto.isbn) {
      const existingBook = await this.bookRepository.findOne({
        where: { isbn: updateBookDto.isbn },
      });

      if (existingBook && existingBook.id !== id) {
        throw new BadRequestException(
          `Book with ISBN ${updateBookDto.isbn} already exists`,
        );
      }
    }

    await this.bookRepository.update(id, updateBookDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.bookRepository.delete(id);
  }
}
