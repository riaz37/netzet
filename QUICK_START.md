# Quick Start Guide - Book Management System

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Set Up PostgreSQL Database

Make sure PostgreSQL is running on your system, then:

```bash
# Create a database (if not exists)
createdb book_management

# Or using psql
psql -U your_user -c "CREATE DATABASE book_management;"
```

### Step 3: Configure Environment

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/book_management?schema=public"
PORT=3000
NODE_ENV=development
```

Replace `your_user` and `your_password` with your PostgreSQL credentials.

### Step 4: Initialize Database

```bash
# Generate Prisma Client
pnpm run prisma:generate

# Create database tables
pnpm run prisma:migrate

# The migration will prompt you to name it, press Enter to accept "init"
```

### Step 5: Start the Application

```bash
# Development mode (with hot reload)
pnpm run start:dev

# Or production mode
pnpm run start:prod
```

The API will be available at `http://localhost:3000`

## 📝 Test the API

### Create an Author

```bash
curl -X POST http://localhost:3000/authors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "J.K.",
    "lastName": "Rowling",
    "bio": "Author of Harry Potter series",
    "birthDate": "1965-07-31"
  }'
```

Save the `id` from the response for the next step.

### Create a Book

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Harry Potter and the Philosopher'\''s Stone",
    "isbn": "978-0-7475-3269-6",
    "genre": "Fantasy",
    "publishedDate": "1997-06-26",
    "authorId": "<paste-author-id-here>"
  }'
```

### Get All Authors

```bash
curl http://localhost:3000/authors
```

### Get All Books

```bash
curl http://localhost:3000/books
```

### Get Books by Author

```bash
curl "http://localhost:3000/books?authorId=<paste-author-id-here>"
```

## 🧪 Run Tests

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 📊 View Database (Optional)

```bash
pnpm run prisma:studio
```

This opens a web interface at `http://localhost:5555` where you can browse and edit your database.

## 🛠 Useful Commands

```bash
# Start in development mode
pnpm run start:dev

# Build for production
pnpm run build

# Run production build
pnpm run start:prod

# Lint code
pnpm run lint

# Format code
pnpm run format

# Generate Prisma Client
pnpm run prisma:generate

# Create new migration
pnpm run prisma:migrate

# Open Prisma Studio
pnpm run prisma:studio
```

## 🔧 Troubleshooting

### Database Connection Error

If you see database connection errors:

1. Check PostgreSQL is running: `systemctl status postgresql` (Linux) or `brew services list` (Mac)
2. Verify the DATABASE_URL in `.env`
3. Check PostgreSQL is listening on port 5432: `psql -U your_user -h localhost -p 5432`

### Prisma Client Not Found

```bash
pnpm run prisma:generate
```

### Migration Errors

```bash
# Reset the database (⚠️ This deletes all data)
npx prisma migrate reset

# Then rerun migrations
pnpm run prisma:migrate
```

## 📖 Next Steps

- Check out [README.md](README.md) for complete documentation
- Read [IMPLEMENTATION_NOTES.md](IMPLEMENTATION_NOTES.md) for architecture details
- Explore the API endpoints using curl or Postman
- Review the test files to understand expected behavior

## 🎯 API Endpoints Summary

### Authors
- `POST /authors` - Create author
- `GET /authors` - List authors (with pagination & search)
- `GET /authors/:id` - Get author by ID
- `PATCH /authors/:id` - Update author
- `DELETE /authors/:id` - Delete author

### Books
- `POST /books` - Create book
- `GET /books` - List books (with pagination, search & filter)
- `GET /books/:id` - Get book by ID
- `PATCH /books/:id` - Update book
- `DELETE /books/:id` - Delete book

Query parameters for GET endpoints:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search query (for authors: firstName/lastName, for books: title/ISBN)
- `authorId` - Filter books by author ID

## 💡 Tips

- Use Postman or Insomnia for easier API testing
- Check `src/common/filters/http-exception.filter.ts` for error handling
- Review service layer in `src/authors/authors.service.ts` for business logic
- All DTOs in `src/*/dto/` show validation rules

