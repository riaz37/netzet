# Book Management System

A production-grade RESTful API for managing books and authors built with NestJS, TypeORM, and PostgreSQL.

## 🚀 Features

- **CRUD Operations** for Authors and Books
- **Advanced Search & Pagination** with query filtering
- **Data Validation** using DTOs with class-validator
- **Comprehensive Error Handling** with custom exception filters
- **Unit & E2E Tests** with Jest and Supertest
- **Database Relations** between Author and Book entities
- **SOLID Principles** implemented throughout the codebase

## 🛠 Tech Stack

- **Framework:** NestJS (v10)
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Validation:** class-validator, class-transformer
- **Testing:** Jest, Supertest
- **TypeScript** with strict type checking

## 📋 Prerequisites

- Node.js (v18+)
- PostgreSQL (v12+)
- pnpm (or npm/yarn)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd netzet
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file (copy from example below)
   touch .env
   ```
   
   Add the following to your `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/book_management?schema=public"
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   # Create database tables (TypeORM will auto-sync in development)
   # Or run migrations for production
   pnpm run migration:run

   # Generate a new migration
   pnpm run migration:generate src/migrations/MigrationName
   ```

## 🚀 Running the Application

```bash
# Development mode
pnpm run dev

# Production mode
pnpm run start:prod

# Build
pnpm run build
```

The API will be available at `http://localhost:3000`

**API Documentation (Swagger)** is available at `http://localhost:3000/api`

## 📖 API Endpoints

### Authors

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/authors` | Create a new author |
| GET | `/authors` | Get all authors (with pagination & search) |
| GET | `/authors/:id` | Get a single author by ID |
| PATCH | `/authors/:id` | Update an author |
| DELETE | `/authors/:id` | Delete an author |

### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/books` | Create a new book |
| GET | `/books` | Get all books (with pagination, search & filter) |
| GET | `/books/:id` | Get a single book by ID (with author) |
| PATCH | `/books/:id` | Update a book |
| DELETE | `/books/:id` | Delete a book |

## 📝 API Usage Examples

### Create an Author

```bash
curl -X POST http://localhost:3000/authors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "bio": "An accomplished author",
    "birthDate": "1980-01-15"
  }'
```

### Get All Authors (with Pagination)

```bash
curl "http://localhost:3000/authors?page=1&limit=10&search=John"
```

### Create a Book

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Novel",
    "isbn": "978-0-123456-78-9",
    "genre": "Fantasy",
    "publishedDate": "2020-01-01",
    "authorId": "<author-id>"
  }'
```

### Get All Books (Filtered by Author)

```bash
curl "http://localhost:3000/books?authorId=<author-id>&page=1&limit=10"
```

## ✅ Validation Rules

### Author
- `firstName` (required, string, 1-100 chars)
- `lastName` (required, string, 1-100 chars)
- `bio` (optional, string, max 1000 chars)
- `birthDate` (optional, ISO date string)

### Book
- `title` (required, string, 1-500 chars)
- `isbn` (required, valid ISBN format)
- `publishedDate` (optional, ISO date string)
- `genre` (optional, string, max 100 chars)
- `authorId` (required, valid UUID)

## 🧪 Testing

```bash
# Run unit tests
pnpm run test

# Run unit tests with coverage
pnpm run test:cov

# Run E2E tests
pnpm run test:e2e

# Run all tests in watch mode
pnpm run test:watch
```

## 📊 Database Schema

### Author
- `id` (UUID, primary key)
- `firstName` (string)
- `lastName` (string)
- `bio` (string, nullable)
- `birthDate` (datetime, nullable)
- `createdAt` (datetime)
- `updatedAt` (datetime)

### Book
- `id` (UUID, primary key)
- `title` (string)
- `isbn` (string, unique)
- `publishedDate` (datetime, nullable)
- `genre` (string, nullable)
- `authorId` (UUID, foreign key → authors.id)
- `createdAt` (datetime)
- `updatedAt` (datetime)

## 🏗 Project Structure

```
src/
├── authors/              # Author module
│   ├── dto/              # Data Transfer Objects
│   │   ├── create-author.dto.ts
│   │   └── update-author.dto.ts
│   ├── authors.controller.ts
│   ├── authors.service.ts
│   ├── authors.service.spec.ts  # Unit tests
│   └── authors.module.ts
├── books/                # Book module
│   ├── dto/
│   │   ├── create-book.dto.ts
│   │   └── update-book.dto.ts
│   ├── books.controller.ts
│   ├── books.service.ts
│   ├── books.service.spec.ts   # Unit tests
│   └── books.module.ts
├── database/             # Database module
│   ├── database.service.ts
│   └── database.module.ts
├── entities/             # TypeORM entities
│   ├── author.entity.ts
│   └── book.entity.ts
├── migrations/            # Database migrations
├── data-source.ts         # TypeORM data source configuration
├── common/               # Shared utilities
│   ├── dto/
│   │   └── pagination.dto.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   ├── utils/
│   │   └── isbn-generator.util.ts
│   └── validators/
│       └── isbn.validator.ts
├── scripts/               # Utility scripts
│   └── generate-isbn.ts  # ISBN generation script
├── app.module.ts
└── main.ts
test/
├── authors.e2e-spec.ts   # E2E tests for authors
└── books.e2e-spec.ts     # E2E tests for books
```

## 🎯 Design Principles

This project follows **SOLID principles**:

- **Single Responsibility:** Each class has one reason to change
- **Open/Closed:** Open for extension, closed for modification
- **Liskov Substitution:** Subtypes must be substitutable for their base types
- **Interface Segregation:** Many client-specific interfaces better than one general
- **Dependency Inversion:** Depend on abstractions, not concretions

## 🔧 Development

```bash
# Generate a new TypeORM migration
pnpm run migration:generate src/migrations/MigrationName

# Run pending migrations
pnpm run migration:run

# Revert last migration
pnpm run migration:revert

# Run TypeORM CLI
pnpm run typeorm

# Generate valid ISBN numbers
pnpm run generate:isbn

# Format code
pnpm run format

# Lint code
pnpm run lint
```

## 📌 Notes

### Database Choice: PostgreSQL

We chose **PostgreSQL** over SQLite for this project because:

1. **Production Ready:** PostgreSQL is a robust, enterprise-grade database suitable for production environments
2. **Advanced Features:** Support for complex queries, JSON operations, full-text search
3. **Concurrent Access:** Better handling of multiple simultaneous connections
4. **Scalability:** Can handle larger datasets and higher traffic loads
5. **Type Safety:** Excellent type support with TypeORM
6. **Relationships:** Strong foreign key constraints and referential integrity

SQLite is excellent for development and small applications, but PostgreSQL provides the scalability and features needed for a production application.

## 📚 Additional Features

### ISBN Generator Utility

The project includes a utility for generating and validating ISBN numbers:
- Supports both ISBN-10 and ISBN-13 formats
- Includes validation logic
- Can be used via script: `pnpm run generate:isbn`

### API Documentation

Swagger/OpenAPI documentation is automatically available at `/api` when the application is running. This provides interactive API documentation where you can test endpoints directly from your browser.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
