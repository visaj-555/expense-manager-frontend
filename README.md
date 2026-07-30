# Expense Manager Frontend

Premium SaaS-style personal finance app (React + Vite + TypeScript + Tailwind + shadcn/ui).

## Scripts

```bash
npm run dev        # local development
npm run build      # production build
npm run lint       # ESLint (also runs on git push)
npm run lint:fix  # auto-fix safe issues
npm run typecheck  # TypeScript check
```

## Learn the codebase

Read **[docs/FRONTEND_LEARNING_GUIDE.md](./docs/FRONTEND_LEARNING_GUIDE.md)** — every concept used in this project, mapped to real files, written for beginners who want to rebuild this without AI.

## Stack

- React 19 + Vite
- TypeScript
- Tailwind CSS v4 + shadcn/ui
- React Router
- TanStack Query (server state)
- Redux Toolkit (auth only)
- React Hook Form + Zod
- Axios + Recharts + Lucide

## Git hooks

Husky runs:
- **pre-commit** → lint-staged (eslint on staged files)
- **pre-push** → full `npm run lint`
