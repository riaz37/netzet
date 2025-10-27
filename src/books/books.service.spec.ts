import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BooksService } from './books.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BooksService', () => {
  let service: BooksService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    book: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    author: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    prismaService = module.get<PrismaService>(PrismaService);
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
        author,
      };

      mockPrismaService.author.findUnique.mockResolvedValue(author);
      mockPrismaService.book.create.mockResolvedValue({
        ...expectedBook,
        author,
      });

      const result = await service.create(createBookDto);

      expect(result).toEqual({ ...expectedBook, author });
      expect(mockPrismaService.author.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockPrismaService.book.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if author does not exist', async () => {
      const createBookDto = {
        title: 'The Great Novel',
        isbn: '978-3-16-148410-0',
        authorId: '999',
      };

      mockPrismaService.author.findUnique.mockResolvedValue(null);

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

      mockPrismaService.author.findUnique.mockResolvedValue(author);
      mockPrismaService.book.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['isbn'] },
      });

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

      mockPrismaService.book.findMany.mockResolvedValue(books);
      mockPrismaService.book.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(books);
      expect(result.total).toBe(1);
      expect(mockPrismaService.book.findMany).toHaveBeenCalled();
      expect(mockPrismaService.book.count).toHaveBeenCalled();
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

      mockPrismaService.book.findUnique.mockResolvedValue(book);

      const result = await service.findOne('1');

      expect(result).toEqual(book);
      expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { author: true },
      });
    });

    it('should throw NotFoundException if book does not exist', async () => {
      mockPrismaService.book.findUnique.mockResolvedValue(null);

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

      mockPrismaService.book.findUnique.mockResolvedValue(existingBook);
      mockPrismaService.book.update.mockResolvedValue({
        ...updatedBook,
        author: existingBook.author,
      });

      const result = await service.update('1', updateDto);

      expect(mockPrismaService.book.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
        include: { author: true },
      });
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

      mockPrismaService.book.findUnique.mockResolvedValue(book);
      mockPrismaService.book.delete.mockResolvedValue(book);

      await service.remove('1');

      expect(mockPrismaService.book.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
