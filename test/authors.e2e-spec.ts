import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { Author } from '../src/entities/author.entity';
import { Book } from '../src/entities/book.entity';
import { Repository } from 'typeorm';

describe('AuthorsController (e2e)', () => {
  let app: INestApplication;
  let authorRepository: Repository<Author>;
  let bookRepository: Repository<Book>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same global pipes and filters as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();

    authorRepository = moduleFixture.get<Repository<Author>>(
      getRepositoryToken(Author),
    );
    bookRepository = moduleFixture.get<Repository<Book>>(
      getRepositoryToken(Book),
    );
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await bookRepository.query('DELETE FROM books');
      await authorRepository.query('DELETE FROM authors');
    } catch (error) {
      // Ignore cleanup errors
    }
    await app.close();
  });

  describe('/authors (POST)', () => {
    it('should create an author', () => {
      return request(app.getHttpServer())
        .post('/authors')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          bio: 'A prolific author',
          birthDate: '1980-01-15',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.firstName).toBe('John');
          expect(res.body.lastName).toBe('Doe');
          expect(res.body.bio).toBe('A prolific author');
        });
    });

    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/authors')
        .send({
          firstName: 'John',
          // missing lastName
        })
        .expect(400);
    });

    it('should return 400 for invalid date format', () => {
      return request(app.getHttpServer())
        .post('/authors')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          birthDate: 'invalid-date',
        })
        .expect(400);
    });
  });

  describe('/authors (GET)', () => {
    it('should return all authors with pagination', () => {
      return request(app.getHttpServer())
        .get('/authors')
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should search authors by name', () => {
      return request(app.getHttpServer())
        .get('/authors')
        .query({ search: 'John' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('/authors/:id (GET)', () => {
    let createdAuthorId: string;

    beforeAll(async () => {
      const author = await authorRepository.save({
        firstName: 'Jane',
        lastName: 'Smith',
        bio: 'Test author for e2e',
      });
      createdAuthorId = author.id;
    });

    it('should return a specific author', () => {
      return request(app.getHttpServer())
        .get(`/authors/${createdAuthorId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdAuthorId);
          expect(res.body.firstName).toBe('Jane');
        });
    });

    it('should return 404 for non-existent author', () => {
      return request(app.getHttpServer())
        .get('/authors/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('/authors/:id (PATCH)', () => {
    let createdAuthorId: string;

    beforeAll(async () => {
      const author = await authorRepository.save({
        firstName: 'Update',
        lastName: 'Test',
      });
      createdAuthorId = author.id;
    });

    it('should update an author', () => {
      return request(app.getHttpServer())
        .patch(`/authors/${createdAuthorId}`)
        .send({
          bio: 'Updated bio',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.bio).toBe('Updated bio');
        });
    });

    it('should return 404 for non-existent author', () => {
      return request(app.getHttpServer())
        .patch('/authors/00000000-0000-0000-0000-000000000000')
        .send({ bio: 'Test' })
        .expect(404);
    });
  });

  describe('/authors/:id (DELETE)', () => {
    let createdAuthorId: string;

    beforeAll(async () => {
      const author = await authorRepository.save({
        firstName: 'Delete',
        lastName: 'Test',
      });
      createdAuthorId = author.id;
    });

    it('should delete an author', () => {
      return request(app.getHttpServer())
        .delete(`/authors/${createdAuthorId}`)
        .expect(204);
    });

    it('should return 404 when deleting non-existent author', () => {
      return request(app.getHttpServer())
        .delete('/authors/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
