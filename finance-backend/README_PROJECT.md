# Finance API - Personal Finance Management Microservice

A lightweight, secure Laravel API microservice for personal finance management, built with Domain-Driven Design (DDD) principles and SOLID architecture.

## Architecture

This project follows **Domain-Driven Design (DDD)** with **CQRS** pattern and **microservice** architecture principles.

### Technology Stack

- **Framework**: Laravel 12
- **PHP**: 8.3+
- **Database**: PostgreSQL 16
- **Cache/Queue**: Redis 7
- **Authentication**: Laravel Sanctum (API Tokens)
- **Authorization**: Spatie Laravel Permission
- **Containerization**: Docker

### Project Structure

```
app/
├── Domain/                    # Pure business logic (no framework dependencies)
│   └── Shared/
│       ├── Contracts/        # Repository and service interfaces
│       ├── Exceptions/       # Domain-specific exceptions
│       ├── Traits/           # Reusable domain traits
│       └── ValueObjects/     # Immutable value objects (Email, Money, etc.)
│
├── Application/              # Use cases and application logic (CQRS)
│   ├── Auth/                 # Authentication use cases
│   │   ├── Commands/         # Write operations (Register, Login, etc.)
│   │   ├── Queries/          # Read operations (GetUser, etc.)
│   │   └── DTOs/             # Data Transfer Objects
│   └── Shared/
│       ├── Commands/         # Base command interfaces
│       ├── Queries/          # Base query interfaces
│       └── DTOs/             # Base DTO classes
│
├── Infrastructure/           # External integrations and persistence
│   ├── Persistence/
│   │   ├── Eloquent/        # Eloquent models
│   │   └── Repositories/    # Repository implementations
│   ├── External/            # External API integrations
│   ├── Auth/                # Authentication implementations
│   └── Queue/               # Queue job implementations
│
└── Presentation/            # HTTP layer (Controllers, Requests, Resources)
    └── API/
        └── V1/
            ├── Controllers/  # API controllers
            ├── Requests/     # Form requests (validation)
            ├── Resources/    # JSON resources (transformers)
            └── Middleware/   # Custom middleware
```

## Key Design Patterns

### 1. Domain-Driven Design (DDD)
- **Domain Layer**: Pure business logic, framework-agnostic
- **Application Layer**: Use cases orchestrating domain logic
- **Infrastructure Layer**: Technical implementations (DB, APIs, etc.)
- **Presentation Layer**: HTTP/API interface

### 2. CQRS (Command Query Responsibility Segregation)
- **Commands**: Write operations that change state
- **Queries**: Read operations that don't change state
- Separate handlers for each operation type

### 3. Repository Pattern
- Abstracts data persistence
- Allows easy switching of data sources
- Makes testing easier with mock repositories

### 4. Value Objects
- Immutable objects representing domain concepts
- Examples: Email, Money, DateRange
- Encapsulate validation logic

## Installation

### Prerequisites

- Docker & Docker Compose
- Git

### Setup with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-backend
   ```

2. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

3. **Update .env for Docker**
   ```env
   DB_HOST=postgres
   DB_PORT=5432
   DB_DATABASE=finance_db
   DB_USERNAME=postgres
   DB_PASSWORD=secret

   REDIS_HOST=redis
   REDIS_PORT=6379
   ```

4. **Build and start containers**
   ```bash
   docker-compose up -d --build
   ```

5. **Install dependencies**
   ```bash
   docker-compose exec app composer install
   ```

6. **Generate application key**
   ```bash
   docker-compose exec app php artisan key:generate
   ```

7. **Run migrations**
   ```bash
   docker-compose exec app php artisan migrate
   ```

8. **Access the API**
   - API Endpoint: http://localhost:8000/api/v1
   - Health Check: http://localhost:8000/api/v1/health

### Local Development (Without Docker)

1. **Install dependencies**
   ```bash
   composer install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Setup database**
   - Create PostgreSQL database
   - Update .env with database credentials
   - Run migrations: `php artisan migrate`

4. **Start development server**
   ```bash
   php artisan serve
   ```

## API Documentation

### Authentication

This API uses **Laravel Sanctum** for token-based authentication.

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "1|abc123...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Authenticated Requests

Include the token in the `Authorization` header:
```http
Authorization: Bearer 1|abc123...
```

### Endpoints

#### Health Check
```http
GET /api/v1/health
```

#### User Profile
```http
GET /api/v1/user/profile
Authorization: Bearer {token}
```

## Database Schema

### PostgreSQL Configuration

The microservice uses PostgreSQL for:
- Better JSON support (JSONB)
- Stronger data integrity
- Advanced indexing capabilities
- ACID compliance for financial data

### Migrations

Run migrations:
```bash
php artisan migrate
```

Create new migration:
```bash
php artisan make:migration create_table_name
```

## Testing

### Run Tests
```bash
php artisan test
```

### With Coverage
```bash
php artisan test --coverage
```

## Security Features

1. **API Token Authentication** (Sanctum)
2. **CORS Configuration** for frontend access
3. **Rate Limiting** on API routes
4. **CSRF Protection** disabled for API (using tokens)
5. **SQL Injection Protection** (PDO prepared statements)
6. **XSS Protection** (input validation and output encoding)
7. **Password Hashing** (bcrypt)

## Performance Optimization

1. **Redis Caching** for frequently accessed data
2. **Queue System** for background jobs
3. **OPcache** enabled in production
4. **Database Indexing** on frequently queried columns
5. **Eager Loading** to prevent N+1 queries

## Docker Services

- **app**: PHP 8.3-FPM with Laravel
- **nginx**: Nginx web server
- **postgres**: PostgreSQL 16 database
- **redis**: Redis 7 for caching and queues

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Execute artisan commands
docker-compose exec app php artisan [command]

# Access container shell
docker-compose exec app bash
```

## Environment Variables

Key environment variables:

```env
APP_NAME="Finance API"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=finance_db
DB_USERNAME=postgres
DB_PASSWORD=secret

REDIS_CLIENT=predis
REDIS_HOST=redis
REDIS_PORT=6379

CACHE_STORE=redis
QUEUE_CONNECTION=redis

SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:3001
SANCTUM_TOKEN_EXPIRATION=1440
```

## Contributing

1. Follow PSR-12 coding standards
2. Write tests for new features
3. Update documentation
4. Use meaningful commit messages

## Code Style

```bash
# Format code
./vendor/bin/pint

# Check code quality
./vendor/bin/phpstan analyse
```

## License

This project is proprietary and confidential.

## Support

For questions and support, contact the development team.
