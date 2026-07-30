# Frontend Learning Guide — Expense Manager

You built this with Cursor. Use this guide to **understand every concept**, so next time you can build similar apps yourself.

---

## 1. Big picture (how a React app starts)

```
index.html
  └── <script src="/src/main.tsx">
        └── createRoot(#root).render(<App />)
              └── <AppProviders>     ← Redux + React Query + Toaster
                    └── <AppRoutes>  ← React Router
```

| File | Job |
|------|-----|
| `index.html` | Single HTML shell. React mounts into `#root`. |
| `src/main.tsx` | Entry: creates the React root and renders `<App />`. |
| `src/App.tsx` | Thin wrapper — only mounts providers. |
| `src/providers/AppProviders.tsx` | Wraps the app with global tools (store, query, toasts). |
| `src/routes/AppRoutes.tsx` | Declares every URL → page. |
| `src/index.css` | Global styles + Tailwind theme tokens (colors, radius). |

**Concept: Single Page Application (SPA)**  
The browser loads one HTML page. React changes what you see without full page reloads. React Router swaps pages by URL.

---

## 2. Folder structure (feature-based architecture)

```
src/
├── api/              # Axios instance (HTTP client + JWT refresh)
├── components/
│   ├── ui/           # Reusable design system (Button, Input, Dialog…)
│   ├── shared/       # App-level shared UI (PageHeader, EmptyState)
│   ├── auth/         # Auth layout / loading screen
│   └── charts/       # Recharts wrappers
├── constants/        # Labels, query keys, chart colors
├── features/         # Feature modules (auth, accounts, …)
│   └── <feature>/
│       ├── components/   # Forms / dialogs for that feature
│       └── hooks/        # React Query hooks for that feature
├── hooks/auth/       # Auth-specific hooks (login, bootstrap, logout)
├── layouts/          # App shell (Sidebar + main content)
├── lib/              # Tiny utilities (cn, formatCurrency)
├── pages/            # Route-level screens (one page ≈ one URL)
├── providers/        # App-wide providers
├── routes/           # Router + Protected/Guest guards
├── services/         # Pure API functions (no React!)
├── store/            # Redux (auth UI state only)
├── types/            # TypeScript types matching backend DTOs
└── utils/            # Helpers (errors, tokens, cleanParams)
```

**Rule of thumb**

| Layer | Can call? | Holds UI? |
|-------|-----------|-----------|
| `pages/` | hooks | yes |
| `features/*/components` | hooks | yes |
| `features/*/hooks` | services | no |
| `services/` | axios | no |
| `components/ui` | nothing | yes (dumb) |

Never put API calls inside a presentational button/card.  
Never put JSX inside a service file.

---

## 3. Core React concepts used here

### 3.1 Components
A function that returns JSX (HTML-like syntax).

```tsx
export default function LoginPage() {
  return <AuthLayout title="Welcome back"><LoginForm /></AuthLayout>
}
```

### 3.2 Props
Data passed from parent → child.

```tsx
<Button variant="outline" onClick={logout}>Sign out</Button>
```

### 3.3 State (`useState`)
Local memory inside a component (search text, dialog open/closed).

```tsx
const [page, setPage] = useState(1)
```

### 3.4 Effects (`useEffect`)
Run code when something changes (bootstrap auth on mount, reset form when dialog opens).

### 3.5 Controlled inputs
Input value lives in React state / form library, not only in the DOM.

---

## 4. Routing (`react-router-dom`)

Defined in `src/routes/AppRoutes.tsx`.

| Concept | Where | Meaning |
|---------|-------|---------|
| `<Routes>` / `<Route>` | AppRoutes | URL map |
| `<Navigate>` | ProtectedRoute | Redirect |
| `<Outlet>` | AppLayout / guards | “Render child route here” |
| `useNavigate()` | hooks | Programmatic redirect after login |
| `useLocation()` | forms | Read `state` passed between pages (e.g. email for OTP) |
| `NavLink` | Sidebar | Link with active styling |

### Route guards

- **GuestRoute** — if logged in → go to `/dashboard` (login page only for guests)
- **ProtectedRoute** — if not logged in → go to `/login`
- **AppLayout** — sidebar shell for all authenticated pages

```
/login  → GuestRoute → LoginPage
/dashboard → ProtectedRoute → AppLayout → DashboardPage
```

---

## 5. Auth flow (end-to-end)

```
Register → OTP verify → Login → tokens in localStorage → verify-token → Redux user
```

| Piece | File | Role |
|-------|------|------|
| Token storage | `utils/tokenStorage.ts` | save/read/clear JWT |
| Axios | `api/axiosInstance.ts` | attach Bearer token; refresh on 401 |
| Auth API | `services/auth.service.ts` | login/register/OTP/password |
| Auth hooks | `hooks/auth/useLogin.ts` etc. | call service + navigate |
| Redux slice | `store/slices/authSlice.ts` | `user`, `isAuthenticated`, `isBootstrapping` |
| Bootstrap | `hooks/auth/useAuthBootstrap.ts` | on app load, restore session via `verify-token` |

**Why Redux for auth?**  
User info is needed in many places (Sidebar name, Settings). Redux = global client state.  
**Why React Query for API lists?**  
Accounts/categories/transactions are server data — caching, refetch, loading/error are Query’s job.

Industry rule used here: **Redux = auth/UI only. React Query = server data.**

---

## 6. Data fetching (TanStack Query)

Pattern used everywhere:

```
Page → useAccounts() hook → accountsService.getAll() → axios → backend
```

Example: `features/accounts/hooks/useAccounts.ts`

| API | Meaning |
|-----|---------|
| `useQuery` | GET / list / read |
| `useMutation` | POST / PATCH / DELETE |
| `invalidateQueries` | After create/update/delete, refresh lists |
| `queryKeys` | Stable cache IDs in `constants/queryKeys.ts` |

**Loading / error / empty** are handled in pages with:
- `<Skeleton>` while loading
- `<ErrorState>` on failure
- `<EmptyState>` when list is empty

---

## 7. Forms (React Hook Form + Zod)

Used in Login, Register, Account/Category/Transaction/Goal dialogs, Settings password.

1. **Zod schema** — defines validation rules  
2. **`useForm({ resolver: zodResolver(schema) })`** — connects form to schema  
3. **`<FormField>`** — shadcn wrapper around RHF `Controller`  
4. On submit → call a mutation hook  

This keeps validation logic out of JSX and matches backend password/email rules.

---

## 8. HTTP layer (Axios)

`src/api/axiosInstance.ts`

1. `baseURL` from `VITE_API_BASE_URL`
2. Request interceptor → add `Authorization: Bearer <accessToken>`
3. Response interceptor → on 401, call `/auth/refresh`, retry once, or clear tokens

`services/*.ts` only call endpoints. They return typed data. No React imports.

`utils/cleanParams.ts` strips empty/`false` query params (avoids NestJS `isArchived=false` bug).

---

## 9. UI system (Tailwind + shadcn)

### Tailwind
Utility classes in JSX: `className="flex gap-4 rounded-xl border p-4"`.

Theme tokens live in `index.css` (`--primary`, `--sidebar`, etc.).

Prefer canonical classes:
- `w-[72px]` → `w-18`
- `pl-[72px]` → `pl-18`
- `top-[50%]` → `top-1/2`
- `ring-[3px]` → `ring-3`

### shadcn/ui
Copy-paste components in `components/ui/` built on Radix primitives (accessible dialogs, selects, menus).

`cn()` in `lib/utils.ts` = `clsx` + `tailwind-merge` → merge class names without conflicts.

### Layout
`layouts/AppLayout.tsx` + `Sidebar.tsx`  
Fixed sidebar; only `<Outlet />` (main content) changes between pages.

---

## 10. Charts (Recharts)

`components/charts/FinanceCharts.tsx` wraps Line/Bar/Pie charts.  
Dashboard & Analytics pages pass API data into these wrappers.

---

## 11. TypeScript types

`types/*.ts` mirror backend response/DTO shapes.

```
types/account.types.ts  → Account, CreateAccountPayload, AccountQueryParams
types/api.types.ts      → ApiResponse<T>, PaginatedResponse<T>
```

Always type API responses. That catches bugs before runtime.

---

## 12. Page → Feature map

| URL | Page file | Main hooks | Backend |
|-----|-----------|------------|---------|
| `/login` | pages/auth/LoginPage | useLogin | POST /auth/login |
| `/register` | RegisterPage | useRegister | POST /auth/register |
| `/verify-otp` | VerifyOtpPage | useVerifyOtp | POST /auth/verify-otp |
| `/dashboard` | DashboardPage | useDashboard | GET /dashboard |
| `/accounts` | AccountsPage | useAccounts, useCreate… | /accounts CRUD |
| `/categories` | CategoriesPage | useCategories… | /categories CRUD |
| `/transactions` | TransactionsPage | useTransactions… | /transactions CRUD |
| `/goals` | GoalsPage | useGoals… | /goals CRUD |
| `/analytics` | AnalyticsPage | useMonthlyAnalytics… | /analytics/* |
| `/settings` | SettingsPage | authService.changePassword | POST /auth/change-password |

---

## 13. Quality gates (before push)

### Frontend
```bash
npm run lint      # ESLint (also runs on git push via Husky)
npm run typecheck # tsc --noEmit
npm run build     # production bundle
```

Husky hooks:
- **pre-commit** → `lint-staged` (lint changed files)
- **pre-push** → full `npm run lint`

### Backend
```bash
npm run lint
```
Also hooked with Husky pre-push / pre-commit.

---

## 14. Mental model to rebuild any CRUD feature yourself

1. Add types in `types/foo.types.ts`
2. Add `services/foo.service.ts` (axios calls)
3. Add `queryKeys.foo`
4. Add `features/foo/hooks/useFoo.ts` (useQuery/useMutation)
5. Add form dialog in `features/foo/components/`
6. Add `pages/foo/FooPage.tsx` (list + dialog + empty/error)
7. Register route in `AppRoutes.tsx` + Sidebar item

That’s the full loop. Same pattern for Accounts, Categories, Transactions, Goals.

---

## 15. Glossary (interview / self-study)

| Term | Meaning |
|------|---------|
| SPA | App that doesn’t reload the full page |
| JSX | HTML-like syntax in JS/TS |
| Hook | Function starting with `use` that taps React features |
| Mutation | Write operation (create/update/delete) |
| Cache invalidation | Tell React Query “this list is stale — refetch” |
| DTO | Data Transfer Object — shape of API payload |
| JWT | JSON Web Token — proof you’re logged in |
| Interceptor | Axios middleware before/after requests |
| Guard | Route wrapper that allows/blocks access |
| Presentational component | UI only, no API |
| Container / page | Wires hooks + UI together |

---

## 16. How to practice without AI

1. Pick one feature (e.g. Goals).
2. Delete its page/hook temporarily (or create a new “Notes” feature).
3. Rebuild using the 7 steps in section 14.
4. Run `npm run lint` and `npm run build` until green.
5. Trace one click: button → mutation → service → Network tab → UI update.

When you can do that alone, you own the stack.
