import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author, Prisma } from '@prisma/client';

@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    return this.prisma.author.create({
      data: createAuthorDto,
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: Author[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.AuthorWhereInput = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.author.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.author.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Author> {
    const author = await this.prisma.author.findUnique({
      where: { id },
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    return author;
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    await this.findOne(id); // Check if exists

    return this.prisma.author.update({
      where: { id },
      data: updateAuthorDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists

    try {
      await this.prisma.author.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Cannot delete author with associated books. Please delete the books first.',
        );
      }
      throw error;
    }
  }
}
