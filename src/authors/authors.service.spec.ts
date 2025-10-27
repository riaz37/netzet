import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthorsService', () => {
  let service: AuthorsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    author: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new author', async () => {
      const createAuthorDto = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'A great author',
        birthDate: '1990-01-01',
      };

      const expectedAuthor = {
        id: '1',
        ...createAuthorDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.author.create.mockResolvedValue(expectedAuthor);

      const result = await service.create(createAuthorDto);

      expect(result).toEqual(expectedAuthor);
      expect(mockPrismaService.author.create).toHaveBeenCalledWith({
        data: createAuthorDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated authors', async () => {
      const authors = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          bio: null,
          birthDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          bio: null,
          birthDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.author.findMany.mockResolvedValue(authors);
      mockPrismaService.author.count.mockResolvedValue(2);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(authors);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(mockPrismaService.author.findMany).toHaveBeenCalled();
      expect(mockPrismaService.author.count).toHaveBeenCalled();
    });

    it('should filter authors by search query', async () => {
      const authors = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          bio: null,
          birthDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.author.findMany.mockResolvedValue(authors);
      mockPrismaService.author.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10, 'John');

      expect(result.data).toEqual(authors);
      expect(mockPrismaService.author.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an author by id', async () => {
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

      const result = await service.findOne('1');

      expect(result).toEqual(author);
      expect(mockPrismaService.author.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if author does not exist', async () => {
      mockPrismaService.author.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an author', async () => {
      const existingAuthor = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        bio: null,
        birthDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateDto = { bio: 'Updated bio' };
      const updatedAuthor = { ...existingAuthor, ...updateDto };

      mockPrismaService.author.findUnique.mockResolvedValue(existingAuthor);
      mockPrismaService.author.update.mockResolvedValue(updatedAuthor);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedAuthor);
      expect(mockPrismaService.author.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete an author', async () => {
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
      mockPrismaService.author.delete.mockResolvedValue(author);

      await service.remove('1');

      expect(mockPrismaService.author.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
