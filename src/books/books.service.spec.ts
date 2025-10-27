import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BooksService } from './books.service';
import { Book } from '../entities/book.entity';
import { Author } from '../entities/author.entity';

describe('BooksService', () => {
  let service: BooksService;
  let bookRepository: Repository<Book>;
  let authorRepository: Repository<Author>;

  const mockBookQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockBookRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockBookQueryBuilder),
  };

  const mockAuthorRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockBookRepository,
        },
        {
          provide: getRepositoryToken(Author),
          useValue: mockAuthorRepository,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    bookRepository = module.get<Repository<Book>>(getRepositoryToken(Book));
    authorRepository = module.get<Repository<Author>>(
      getRepositoryToken(Author),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new book', async () => {
      const createBookDto = {
        title: 'The Great Novel',
        isbn: '978-3-16-148410-0',
        genre: 'Fantasy',
        publishedDate: '2020-01-01',
        authorId: '1',
      };

      const author = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        bio: null,
        birthDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedBook = {
        id: '1',
        ...createBookDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthorRepository.findOne.mockResolvedValue(author);
      mockBookRepository.create.mockReturnValue(expectedBook);
      mockBookRepository.save.mockResolvedValue(expectedBook);

      const result = await service.create(createBookDto);

      expect(result).toEqual(expectedBook);
      expect(mockAuthorRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockBookRepository.create).toHaveBeenCalledWith(createBookDto);
      expect(mockBookRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if author does not exist', async () => {
      const createBookDto = {
        title: 'The Great Novel',
        isbn: '978-3-16-148410-0',
        authorId: '999',
      };

      mockAuthorRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createBookDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if isbn already exists', async () => {
      const createBookDto = {
        title: 'The Great Novel',
        isbn: '978-3-16-148410-0',
        authorId: '1',
      };

      const author = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        bio: null,
        birthDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthorRepository.findOne.mockResolvedValue(author);
      mockBookRepository.findOne.mockResolvedValue({ id: '2' }); // ISBN exists

      await expect(service.create(createBookDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      const books = [
        {
          id: '1',
          title: 'Book 1',
          isbn: '978-3-16-148410-0',
          genre: 'Fantasy',
          publishedDate: new Date(),
          authorId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
          author: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            bio: null,
            birthDate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      mockBookQueryBuilder.getManyAndCount.mockResolvedValue([books, 1]);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(books);
      expect(result.total).toBe(1);
      expect(mockBookQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      const book = {
        id: '1',
        title: 'Book 1',
        isbn: '978-3-16-148410-0',
        genre: 'Fantasy',
        publishedDate: new Date(),
        authorId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          bio: null,
          birthDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockBookRepository.findOne.mockResolvedValue(book);

      const result = await service.findOne('1');

      expect(result).toEqual(book);
      expect(mockBookRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['author'],
      });
    });

    it('should throw NotFoundException if book does not exist', async () => {
      mockBookRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const existingBook = {
        id: '1',
        title: 'Book 1',
        isbn: '978-3-16-148410-0',
        genre: 'Fantasy',
        publishedDate: new Date(),
        authorId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          bio: null,
          birthDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const updateDto = { genre: 'Sci-Fi' };
      const updatedBook = { ...existingBook, ...updateDto };

      mockBookRepository.findOne.mockResolvedValueOnce(existingBook);
      mockBookRepository.update.mockResolvedValue(undefined);
      mockBookRepository.findOne.mockResolvedValueOnce(updatedBook);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedBook);
      expect(mockBookRepository.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a book', async () => {
      const book = {
        id: '1',
        title: 'Book 1',
        isbn: '978-3-16-148410-0',
        genre: 'Fantasy',
        publishedDate: new Date(),
        authorId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          bio: null,
          birthDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockBookRepository.findOne.mockResolvedValue(book);
      mockBookRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(mockBookRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
