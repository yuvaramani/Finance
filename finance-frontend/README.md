# Finance Frontend - Personal Finance Management System

A modern, scalable React frontend application built with Material UI, connected to a Laravel backend via Sanctum authentication.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📚 Full Documentation

For complete setup instructions, architecture details, and development guidelines, see the comprehensive documentation in this README below.

---

## Tech Stack

- React 18 + Vite
- Material UI (MUI)
- React Router DOM
- React Query (TanStack Query)
- Axios with Laravel Sanctum
- React Hook Form + Yup
- Notistack

## Project Structure

```
src/
├── api/              # API layer (axios, endpoints, services)
├── components/       # Reusable UI components
├── features/         # Feature modules (auth, dashboard, etc.)
├── routes/           # Routing configuration
├── contexts/         # React Context providers
├── store/            # React Query setup
├── styles/           # Global styles and MUI theme
└── hooks/            # Custom React hooks
```

## Authentication

Uses Laravel Sanctum with HttpOnly cookies. See `src/contexts/AuthContext.jsx` for implementation.

## Development

```bash
npm run dev        # Start dev server (port 3000)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Environment Variables

Create `.env.development`:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_PREFIX=/api/v1
```

## License

Proprietary and confidential.
