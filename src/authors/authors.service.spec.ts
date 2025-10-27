import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthorsService } from './authors.service';
import { Author } from '../entities/author.entity';

describe('AuthorsService', () => {
  let service: AuthorsService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: getRepositoryToken(Author),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
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

      mockRepository.create.mockReturnValue(expectedAuthor);
      mockRepository.save.mockResolvedValue(expectedAuthor);

      const result = await service.create(createAuthorDto);

      expect(result).toEqual(expectedAuthor);
      expect(mockRepository.create).toHaveBeenCalledWith(createAuthorDto);
      expect(mockRepository.save).toHaveBeenCalled();
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

      mockQueryBuilder.getManyAndCount.mockResolvedValue([authors, 2]);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(authors);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
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

      mockQueryBuilder.getManyAndCount.mockResolvedValue([authors, 1]);

      const result = await service.findAll(1, 10, 'John');

      expect(result.data).toEqual(authors);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
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

      mockRepository.findOne.mockResolvedValue(author);

      const result = await service.findOne('1');

      expect(result).toEqual(author);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if author does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

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

      mockRepository.findOne.mockResolvedValueOnce(existingAuthor);
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.findOne.mockResolvedValueOnce(updatedAuthor);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedAuthor);
      expect(mockRepository.update).toHaveBeenCalledWith('1', updateDto);
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

      mockRepository.findOne.mockResolvedValue(author);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
