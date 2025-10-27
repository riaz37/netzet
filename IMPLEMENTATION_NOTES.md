# Implementation Notes - Book Management System

## Database: PostgreSQL with Prisma

**Why PostgreSQL instead of SQLite?**

For a production-grade application, PostgreSQL offers several key advantages:

1. **Scalability**: Handles concurrent connections and large datasets efficiently
2. **ACID Compliance**: Full transaction support with complex constraints
3. **Relational Integrity**: Strong foreign key constraints and referential integrity
4. **Production Ready**: Battle-tested in enterprise environments
5. **Advanced Features**: JSON support, full-text search, complex queries
6. **Type Safety**: Excellent integration with Prisma for type-safe database access

SQLite would be suitable for development or small applications, but PostgreSQL provides the robustness required for production deployments.

## Architecture & SOLID Principles

### Single Responsibility Principle (SRP)
- Each service (`AuthorsService`, `BooksService`) handles only its domain logic
- `PrismaService` manages only database connections
- Controllers handle only HTTP request/response logic
- DTOs serve only data validation and transfer

### Open/Closed Principle (OCP)
- Services are extensible through dependency injection
- Validation pipes and exception filters can be extended without modifying core classes
- Module-based architecture allows adding features without touching existing code

### Liskov Substitution Principle (LSP)
- `PrismaService` extends `PrismaClient` and can be used wherever the client is expected
- Module imports maintain substitution contracts

### Interface Segregation Principle (ISP)
- Focused DTOs (`CreateAuthorDto`, `UpdateAuthorDto`) instead of monolithic transfer objects
- Separate DTOs for different operations reduce client dependencies

### Dependency Inversion Principle (DIP)
- Services depend on `PrismaService` abstraction, not concrete Prisma implementation
- Modules are injected via NestJS's dependency injection system
- Easy to mock for testing

## Key Features Implemented

### 1. Data Validation (class-validator)
- **Required fields**: Enforced at DTO level
- **ISBN validation**: Custom regex pattern for ISBN-10 and ISBN-13
- **Date validation**: ISO date string format checking
- **String constraints**: Min/max length validations
- **Type conversion**: Automatic transformation with `class-transformer`

### 2. Error Handling
- **Custom Exception Filter**: Global error handling with consistent response format
- **404 Not Found**: Clear messaging when resources don't exist
- **400 Bad Request**: Detailed validation error messages
- **409 Conflict**: Detected for unique constraint violations (e.g., duplicate ISBN)
- **Logging**: All errors logged with context

### 3. Search & Pagination
- **Authors**: Filter by firstName/lastName (case-insensitive partial match)
- **Books**: Filter by title/ISBN (case-insensitive partial match)
- **Author Filter**: Books can be filtered by authorId
- **Pagination**: Default page=1, limit=10 with configurable parameters

### 4. Database Relations
- **One-to-Many**: Author → Books
- **Cascade Delete**: Books are deleted when author is removed
- **Foreign Key Constraints**: Enforce referential integrity
- **Includes**: Book queries automatically include author information

### 5. Testing Strategy

#### Unit Tests
- **Service layer**: AuthorsService, BooksService with mocked Prisma
- **Coverage**: CRUD operations, error cases, edge conditions
- **Fast execution**: No database required
- **Mocking**: PrismaService dependencies are mocked

#### E2E Tests
- **Integration testing**: Full request/response cycle
- **Database interactions**: Real Prisma operations (cleaned up after tests)
- **Multiple scenarios**: Success cases, error cases, edge cases
- **Authentication**: Could be extended with auth middleware

### 6. API Design

#### RESTful Conventions
- **GET**: Retrieve resources (list or single)
- **POST**: Create new resources
- **PATCH**: Partial updates
- **DELETE**: Remove resources
- **Proper HTTP codes**: 200, 201, 204, 400, 404, 409

#### Query Parameters
- `page`: Pagination page number
- `limit`: Items per page
- `search`: Free-text search
- `authorId`: Filter books by author

#### Response Format
```typescript
// Paginated responses
{
  data: T[],
  total: number,
  page: number,
  limit: number
}

// Single resource
{
  id: string,
  ...resourceFields,
  author?: {...} // for book responses
}

// Error responses
{
  statusCode: number,
  message: string | string[],
  error: string,
  timestamp: string,
  path: string
}
```

## File Structure

```
src/
├── authors/
│   ├── dto/
│   │   ├── create-author.dto.ts      # Create validation rules
│   │   └── update-author.dto.ts      # Update validation rules
│   ├── authors.controller.ts         # HTTP layer
│   ├── authors.service.ts            # Business logic
│   ├── authors.service.spec.ts      # Unit tests
│   └── authors.module.ts             # Module definition
├── books/
│   ├── dto/
│   │   ├── create-book.dto.ts        # Create validation rules
│   │   └── update-book.dto.ts        # Update validation rules
│   ├── books.controller.ts           # HTTP layer
│   ├── books.service.ts              # Business logic
│   ├── books.service.spec.ts         # Unit tests
│   └── books.module.ts               # Module definition
├── prisma/
│   ├── prisma.service.ts             # Database client
│   └── prisma.module.ts              # Database module
├── common/
│   ├── dto/
│   │   └── pagination.dto.ts         # Shared pagination
│   ├── filters/
│   │   └── http-exception.filter.ts  # Error handling
│   └── pipes/
│       └── validation.pipe.ts        # Validation logic
├── app.module.ts                     # Root module
└── main.ts                           # Application entry

test/
├── authors.e2e-spec.ts               # E2E author tests
└── books.e2e-spec.ts                 # E2E book tests

prisma/
├── schema.prisma                     # Database schema
└── migrations/                       # Migration files
```

## Setup Instructions

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure database**
   - Set up PostgreSQL database
   - Update `.env` with connection string

3. **Initialize database**
   ```bash
   # Generate Prisma Client
   pnpm run prisma:generate

   # Run migrations
   pnpm run prisma:migrate

   # (Optional) Open Prisma Studio
   pnpm run prisma:studio
   ```

4. **Start development server**
   ```bash
   pnpm run start:dev
   ```

5. **Run tests**
   ```bash
   # Unit tests
   pnpm run test

   # E2E tests
   pnpm run test:e2e

   # Coverage
   pnpm run test:cov
   ```

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/book_management?schema=public"
PORT=3000
NODE_ENV=development
```

## Production Considerations

1. **Database**: Use connection pooling for PostgreSQL
2. **Security**: Add authentication middleware (JWT)
3. **Rate Limiting**: Implement throttling
4. **CORS**: Configure allowed origins
5. **Logging**: Use structured logging (Winston/Pino)
6. **Monitoring**: Add health checks and metrics
7. **Caching**: Consider Redis for frequently accessed data
8. **Documentation**: Add Swagger/OpenAPI documentation

## Future Enhancements

- Authentication & Authorization (JWT)
- Rate limiting per user/IP
- Advanced search with filters
- Bulk operations
- Soft deletes
- Audit logging
- Caching layer
- OpenAPI/Swagger documentation
- GraphQL support
- Message queue for async operations

