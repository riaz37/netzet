import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book, Prisma } from '@prisma/client';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    // Check if author exists
    const author = await this.prisma.author.findUnique({
      where: { id: createBookDto.authorId },
    });

    if (!author) {
      throw new BadRequestException(
        `Author with ID ${createBookDto.authorId} not found`,
      );
    }

    try {
      return await this.prisma.book.create({
        data: createBookDto,
        include: { author: true },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          `Book with ISBN ${createBookDto.isbn} already exists`,
        );
      }
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    authorId?: string,
  ): Promise<{ data: Book[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.BookWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (authorId) {
      where.authorId = authorId;
    }

    const [data, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.book.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    await this.findOne(id); // Check if exists

    // If updating authorId, check if new author exists
    if (updateBookDto.authorId) {
      const author = await this.prisma.author.findUnique({
        where: { id: updateBookDto.authorId },
      });

      if (!author) {
        throw new BadRequestException(
          `Author with ID ${updateBookDto.authorId} not found`,
        );
      }
    }

    try {
      return await this.prisma.book.update({
        where: { id },
        data: updateBookDto,
        include: { author: true },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          `Book with ISBN ${updateBookDto.isbn} already exists`,
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists

    await this.prisma.book.delete({
      where: { id },
    });
  }
}
