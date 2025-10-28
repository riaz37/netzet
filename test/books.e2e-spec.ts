import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { Author } from '../src/entities/author.entity';
import { Book } from '../src/entities/book.entity';
import { Repository } from 'typeorm';

describe('BooksController (e2e)', () => {
  let app: INestApplication;
  let authorRepository: Repository<Author>;
  let bookRepository: Repository<Book>;
  let testAuthorId: string;

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

    // Create a test author for book operations
    const author = await authorRepository.save({
      firstName: 'Test',
      lastName: 'Author',
    });
    testAuthorId = author.id;
  });

  afterAll(async () => {
    // Clean up test data
    try {
      // Delete books first due to foreign key constraints
      await bookRepository.query('DELETE FROM books');
      await authorRepository.query('DELETE FROM authors');
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
    await app.close();
  });

  describe('/books (POST)', () => {
    it('should create a book', () => {
      return request(app.getHttpServer())
        .post('/books')
        .send({
          title: 'The Great Novel',
          isbn: '9780306406157',
          genre: 'Fantasy',
          publishedDate: '2020-01-01',
          authorId: testAuthorId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('The Great Novel');
          expect(res.body.isbn).toBe('9780306406157');
          expect(res.body).toHaveProperty('author');
          expect(res.body.author.id).toBe(testAuthorId);
        });
    });

    it('should return 400 for invalid author', () => {
      return request(app.getHttpServer())
        .post('/books')
        .send({
          title: 'Test Book',
          isbn: '9781234567890',
          authorId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(400);
    });

    it('should return 400 for invalid ISBN', () => {
      return request(app.getHttpServer())
        .post('/books')
        .send({
          title: 'Test Book',
          isbn: 'invalid-isbn',
          authorId: testAuthorId,
        })
        .expect(400);
    });
  });

  describe('/books (GET)', () => {
    it('should return all books with pagination', () => {
      return request(app.getHttpServer())
        .get('/books')
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

    it('should search books by title', () => {
      return request(app.getHttpServer())
        .get('/books')
        .query({ search: 'Great' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter books by authorId', () => {
      return request(app.getHttpServer())
        .get('/books')
        .query({ authorId: testAuthorId })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('/books/:id (GET)', () => {
    let createdBookId: string;
    let localAuthorId: string;

    beforeAll(async () => {
      const author = await authorRepository.save({
        firstName: 'GET',
        lastName: 'Author',
      });
      localAuthorId = author.id;

      // Create book via API to ensure proper relationships
      const response = await new Promise<any>((resolve, reject) => {
        request(app.getHttpServer())
          .post('/books')
          .send({
            title: 'Test Book',
            isbn: '9781861972712',
            authorId: localAuthorId,
          })
          .expect(201)
          .end((err, res) => {
            if (err) reject(err);
            else resolve(res);
          });
      });
      createdBookId = response.body.id;
    });

    afterAll(async () => {
      // Clean up this test's data
      try {
        await bookRepository.delete(createdBookId);
        // Only delete the author if it's not the main test author
        if (localAuthorId !== testAuthorId) {
          await authorRepository.delete(localAuthorId);
        }
      } catch (error) {
        console.warn('Individual test cleanup error:', error);
      }
    });

    it('should return a specific book with author', () => {
      return request(app.getHttpServer())
        .get(`/books/${createdBookId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdBookId);
          expect(res.body.title).toBe('Test Book');
          expect(res.body).toHaveProperty('author');
        });
    });

    it('should return 404 for non-existent book', () => {
      return request(app.getHttpServer())
        .get('/books/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('/books/:id (PATCH)', () => {
    let createdBookId: string;
    let localAuthorId: string;

    beforeAll(async () => {
      const author = await authorRepository.save({
        firstName: 'PATCH',
        lastName: 'Author',
      });
      localAuthorId = author.id;

      // Create book via API to ensure proper relationships
      const response = await new Promise<any>((resolve, reject) => {
        request(app.getHttpServer())
          .post('/books')
          .send({
            title: 'Update Test Book',
            isbn: '9780131101630',
            authorId: localAuthorId,
          })
          .expect(201)
          .end((err, res) => {
            if (err) reject(err);
            else resolve(res);
          });
      });
      createdBookId = response.body.id;
    });

    afterAll(async () => {
      // Clean up this test's data
      try {
        await bookRepository.delete(createdBookId);
        // Only delete the author if it's not the main test author
        if (localAuthorId !== testAuthorId) {
          await authorRepository.delete(localAuthorId);
        }
      } catch (error) {
        console.warn('Individual test cleanup error:', error);
      }
    });

    it('should update a book', () => {
      return request(app.getHttpServer())
        .patch(`/books/${createdBookId}`)
        .send({
          genre: 'Science Fiction',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.genre).toBe('Science Fiction');
        });
    });

    it('should return 404 for non-existent book', () => {
      return request(app.getHttpServer())
        .patch('/books/00000000-0000-0000-0000-000000000000')
        .send({ genre: 'Test' })
        .expect(404);
    });
  });

  describe('/books/:id (DELETE)', () => {
    let createdBookId: string;
    let localAuthorId: string;

    beforeAll(async () => {
      const author = await authorRepository.save({
        firstName: 'Delete',
        lastName: 'Author',
      });
      localAuthorId = author.id;

      // Create book via API to ensure proper relationships
      const response = await new Promise<any>((resolve, reject) => {
        request(app.getHttpServer())
          .post('/books')
          .send({
            title: 'Delete Test Book',
            isbn: '9780262033848',
            authorId: author.id,
          })
          .expect(201)
          .end((err, res) => {
            if (err) reject(err);
            else resolve(res);
          });
      });
      createdBookId = response.body.id;
    });

    afterAll(async () => {
      // Clean up this test's data
      try {
        await bookRepository.delete(createdBookId);
        // Only delete the author if it's not the main test author
        if (localAuthorId !== testAuthorId) {
          await authorRepository.delete(localAuthorId);
        }
      } catch (error) {
        console.warn('Individual test cleanup error:', error);
      }
    });

    it('should delete a book', () => {
      return request(app.getHttpServer())
        .delete(`/books/${createdBookId}`)
        .expect(204);
    });

    it('should return 404 when deleting non-existent book', () => {
      return request(app.getHttpServer())
        .delete('/books/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
