# Personal Finance Management System - Project Overview

## 📁 Project Structure

```
C:\xampp\htdocs\Finance/
├── finance-backend/          # Laravel API Microservice
│   ├── app/
│   │   ├── Domain/          # Business logic (DDD)
│   │   ├── Application/     # Use cases (CQRS)
│   │   ├── Infrastructure/  # External services
│   │   └── Presentation/    # API controllers
│   ├── docker/              # Docker configuration
│   ├── routes/api.php       # API routes
│   └── docker-compose.yml   # Services: Laravel, Nginx, PostgreSQL, Redis
│
└── finance-frontend/         # React Frontend Application
    ├── src/
    │   ├── api/             # Axios + API services
    │   ├── components/      # Reusable components
    │   ├── features/        # Feature modules
    │   ├── routes/          # React Router
    │   ├── contexts/        # Auth & Theme contexts
    │   ├── store/           # React Query
    │   └── styles/          # MUI theme
    └── package.json
```

---

## 🚀 Backend (Laravel) - Quick Start

### Start Backend with Docker

```bash
cd finance-backend

# Start all services (Laravel, PostgreSQL, Redis, Nginx)
docker-compose up -d

# Run migrations
docker-compose exec app php artisan migrate

# Access API
# http://localhost:8000/api/v1/health
```

### Without Docker

```bash
cd finance-backend
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

**Backend URL**: `http://localhost:8000`
**API Prefix**: `/api/v1`

---

## 🎨 Frontend (React) - Quick Start

### Start Frontend

```bash
cd finance-frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Frontend URL**: `http://localhost:3002`

### Environment Configuration

Make sure `.env.development` points to your backend:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_PREFIX=/api/v1
```

---

## 🔐 Authentication Flow

### How it Works

1. **CSRF Protection**: Frontend fetches CSRF cookie from backend (`/sanctum/csrf-cookie`)
2. **Login**: User submits credentials to `/api/v1/auth/login`
3. **Session**: Laravel Sanctum creates session with HttpOnly cookie
4. **Requests**: All subsequent requests include the cookie automatically
5. **Logout**: POST to `/api/v1/auth/logout` clears session

### Key Files

**Backend:**
- `app/api/services/authService.js` - Auth API calls
- `app/contexts/AuthContext.jsx` - Auth state management

**Frontend:**
- `routes/api.php` - Auth endpoints
- `app/Models/User.php` - User model with Sanctum

---

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/user/profile` - Get user profile

### Future Endpoints (To be implemented)
- `/api/v1/transactions` - Transaction CRUD
- `/api/v1/budgets` - Budget management
- `/api/v1/categories` - Categories
- `/api/v1/reports` - Financial reports
- `/api/v1/goals` - Financial goals

---

## 🛠️ Technology Stack

### Backend (finance-backend)
- **Framework**: Laravel 12
- **Language**: PHP 8.3+
- **Database**: PostgreSQL 16
- **Cache/Queue**: Redis 7
- **Authentication**: Laravel Sanctum
- **Architecture**: DDD (Domain-Driven Design)
- **API Style**: RESTful
- **Containerization**: Docker

### Frontend (finance-frontend)
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Material UI (MUI)
- **Routing**: React Router DOM v6
- **State Management**: React Query + Context API
- **HTTP Client**: Axios
- **Form Validation**: React Hook Form + Yup
- **Notifications**: Notistack
- **Date Library**: Day.js

---

## 🔄 Development Workflow

### Starting Both Services

**Terminal 1 - Backend:**
```bash
cd finance-backend
docker-compose up
```

**Terminal 2 - Frontend:**
```bash
cd finance-frontend
npm run dev
```

### Testing the Connection

1. Backend health check: `http://localhost:8000/api/v1/health`
2. Frontend: `http://localhost:3002`
3. Try logging in (you'll need to create user first via seeder or registration)

---

## 📦 Key Features Implemented

### ✅ Backend
- [x] Laravel project with DDD structure
- [x] Sanctum authentication setup
- [x] PostgreSQL database configuration
- [x] Redis caching
- [x] API versioning (v1)
- [x] CORS configuration
- [x] Docker containerization
- [x] Base domain contracts and value objects

### ✅ Frontend
- [x] React project with Vite
- [x] Material UI theming (light/dark mode)
- [x] Protected and public routes
- [x] Axios with Sanctum CSRF handling
- [x] React Query for server state
- [x] Auth context with login/logout
- [x] Feature-based folder structure
- [x] Path aliases configured

---

## 🚧 Next Steps - Implementation Priority

### Phase 1: Authentication UI (1-2 days)
1. Build Login form with validation
2. Build Register form with validation
3. Add loading states and error handling
4. Style auth pages with Material UI

### Phase 2: Dashboard (2-3 days)
1. Create dashboard layout with sidebar
2. Add summary widgets (balance, expenses, income)
3. Recent transactions list
4. Charts for spending overview

### Phase 3: Transactions (3-4 days)
1. Backend: Create Transaction model, migration, controller
2. Frontend: Transaction list with DataTable
3. Add/Edit/Delete transaction forms
4. Filters and search functionality
5. Pagination

### Phase 4: Categories & Budgets (2-3 days)
1. Backend: Category and Budget models
2. Frontend: Category management UI
3. Budget creation and tracking
4. Budget vs actual spending visualization

### Phase 5: Reports & Analytics (3-4 days)
1. Spending reports by category
2. Income vs expense trends
3. Monthly/yearly comparisons
4. Charts and visualizations (Chart.js or Recharts)

### Phase 6: Goals (2-3 days)
1. Financial goal setting
2. Progress tracking
3. Goal notifications and reminders

---

## 📝 Important Notes

### Security
- ✅ CSRF protection enabled
- ✅ HttpOnly cookies (no XSS vulnerabilities)
- ✅ API token authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation on both frontend and backend

### Performance
- ✅ Redis caching
- ✅ Database indexing
- ✅ React Query caching
- ✅ Code splitting with lazy loading
- ✅ Optimized Docker images

### Scalability
- ✅ Microservice architecture
- ✅ Domain-Driven Design (DDD)
- ✅ Feature-based frontend structure
- ✅ Containerized deployment

---

## 🐛 Troubleshooting

### Backend Issues

**"Connection refused" to PostgreSQL:**
```bash
# Check if Docker containers are running
docker-compose ps

# Restart services
docker-compose down
docker-compose up -d
```

**"CSRF token mismatch":**
- Make sure `SANCTUM_STATEFUL_DOMAINS` in `.env` includes your frontend domain
- Frontend must call `/sanctum/csrf-cookie` before login

### Frontend Issues

**"Network Error" when calling API:**
- Check backend is running: `http://localhost:8000/api/v1/health`
- Verify `.env.development` has correct `VITE_API_BASE_URL`
- Check browser console for CORS errors

**"Cannot find module" errors:**
- Clear `node_modules`: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

---

## 📚 Documentation Links

- [Laravel Documentation](https://laravel.com/docs)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [React Documentation](https://react.dev)
- [Material UI](https://mui.com)
- [React Query](https://tanstack.com/query)
- [React Router](https://reactrouter.com)

---

## 👥 Project Team

- **Backend**: Laravel DDD architecture
- **Frontend**: React + Material UI
- **Database**: PostgreSQL
- **DevOps**: Docker

---

## 📄 License

This project is proprietary and confidential.

---

**Built with ❤️ for efficient personal finance management**
