import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from '@/books/books.service';
import { BooksController } from '@/books/books.controller';
import { Book } from '@/entities/book.entity';
import { Author } from '@/entities/author.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Author])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
