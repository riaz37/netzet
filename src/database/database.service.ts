import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from '../entities/author.entity';
import { Book } from '../entities/book.entity';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(Author)
    public readonly authorRepository: Repository<Author>,
    @InjectRepository(Book)
    public readonly bookRepository: Repository<Book>,
  ) {}
}
