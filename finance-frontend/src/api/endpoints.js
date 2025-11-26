/**
 * API Endpoints Configuration
 * Centralized endpoint definitions for type safety and maintainability
 */

export const ENDPOINTS = {
  // Health Check
  HEALTH: '/health',

  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    USER: '/user/profile',
    REFRESH: '/auth/refresh',
  },

  // Transactions
  TRANSACTIONS: {
    LIST: '/transactions',
    CREATE: '/transactions',
    DETAIL: (id) => `/transactions/${id}`,
    UPDATE: (id) => `/transactions/${id}`,
    DELETE: (id) => `/transactions/${id}`,
  },

  // Budgets
  BUDGETS: {
    LIST: '/budgets',
    CREATE: '/budgets',
    DETAIL: (id) => `/budgets/${id}`,
    UPDATE: (id) => `/budgets/${id}`,
    DELETE: (id) => `/budgets/${id}`,
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    DETAIL: (id) => `/categories/${id}`,
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
  },

  // Reports
  REPORTS: {
    SUMMARY: '/reports/summary',
    SPENDING: '/reports/spending',
    INCOME: '/reports/income',
    TRENDS: '/reports/trends',
  },

  // Goals
  GOALS: {
    LIST: '/goals',
    CREATE: '/goals',
    DETAIL: (id) => `/goals/${id}`,
    UPDATE: (id) => `/goals/${id}`,
    DELETE: (id) => `/goals/${id}`,
    PROGRESS: (id) => `/goals/${id}/progress`,
  },

  // Employees
  EMPLOYEES: {
    LIST: '/employees',
    CREATE: '/employees',
    DETAIL: (id) => `/employees/${id}`,
    UPDATE: (id) => `/employees/${id}`,
    DELETE: (id) => `/employees/${id}`,
    ARCHIVE: (id) => `/employees/${id}/archive`,
  },

  // Projects
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    DETAIL: (id) => `/projects/${id}`,
    UPDATE: (id) => `/projects/${id}`,
    DELETE: (id) => `/projects/${id}`,
  },

  // Groups
  GROUPS: {
    LIST: '/groups',
    CREATE: '/groups',
    DETAIL: (id) => `/groups/${id}`,
    UPDATE: (id) => `/groups/${id}`,
    DELETE: (id) => `/groups/${id}`,
  },

  // Income Sources
  INCOME_SOURCES: {
    LIST: '/income-sources',
    CREATE: '/income-sources',
    DETAIL: (id) => `/income-sources/${id}`,
    UPDATE: (id) => `/income-sources/${id}`,
    DELETE: (id) => `/income-sources/${id}`,
  },

  // Incomes
  INCOMES: {
    LIST: '/incomes',
    CREATE: '/incomes',
    DETAIL: (id) => `/incomes/${id}`,
    UPDATE: (id) => `/incomes/${id}`,
    DELETE: (id) => `/incomes/${id}`,
  },

  // Expense Categories
  EXPENSE_CATEGORIES: {
    LIST: '/expense-categories',
    CREATE: '/expense-categories',
    DETAIL: (id) => `/expense-categories/${id}`,
    UPDATE: (id) => `/expense-categories/${id}`,
    DELETE: (id) => `/expense-categories/${id}`,
  },

  // Expenses
  EXPENSES: {
    LIST: '/expenses',
    CREATE: '/expenses',
    DETAIL: (id) => `/expenses/${id}`,
    UPDATE: (id) => `/expenses/${id}`,
    DELETE: (id) => `/expenses/${id}`,
  },

  // Accounts
  ACCOUNTS: {
    LIST: '/accounts',
    CREATE: '/accounts',
    DETAIL: (id) => `/accounts/${id}`,
    UPDATE: (id) => `/accounts/${id}`,
    DELETE: (id) => `/accounts/${id}`,
  },
};
