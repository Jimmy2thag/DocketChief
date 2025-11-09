# GitHub Copilot Repository Instructions

## Project Overview

DocketChief is a legal case management web application built with:
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL database + authentication)
- **Styling**: Tailwind CSS with Radix UI components
- **Routing**: React Router v6
- **State Management**: React Query (@tanstack/react-query)
- **Build Tool**: Vite 5.x with SWC for fast compilation

This is a single-page application (SPA) that helps legal professionals manage cases, documents, calendars, and client communications.

## Development Setup

### Prerequisites
- Node.js >= 20 (< 21)
- npm 10+

### Installation
```bash
npm install
```

### Environment Variables
Copy `.env.example` to `.env` and configure:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_APP_NAME`: Application name (default: "Docket Chief")
- `VITE_ENVIRONMENT`: Environment (development/production)
- `VITE_PAYMENTS_ENABLED`: Enable/disable payment features

### Running the Application
```bash
# Development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Preview production build
npm run preview
```

## Code Quality Standards

### Linting
```bash
npm run lint
```

- ESLint is configured with TypeScript support
- React Hooks rules are enforced
- Unused variables warnings are disabled (`@typescript-eslint/no-unused-vars: off`)
- **Note**: There are existing linting errors in the codebase. Do not fix unrelated linting errors unless they are directly related to your changes.

### TypeScript
- Strict mode is NOT currently enabled
- Use TypeScript for all new files (`.ts` or `.tsx`)
- Avoid using `any` type when possible (existing code has some `any` usage)

### Code Style
- Use functional components with hooks (not class components)
- Follow existing patterns for component structure
- Components use shadcn/ui and Radix UI primitives
- Use Tailwind CSS for styling (avoid inline styles)

## Project Structure

```
/src
  /components       - Reusable React components
  /contexts         - React context providers
  /hooks            - Custom React hooks
  /lib              - Utility functions and libraries
  /pages            - Top-level page components
  App.tsx           - Main application component
  main.tsx          - Application entry point

/supabase
  /functions        - Supabase Edge Functions

/public             - Static assets
```

### Key Architectural Patterns
- Path aliasing: Use `@/` to import from `src/` directory
- Components use shadcn/ui component library patterns
- Authentication is handled via Supabase Auth
- Data fetching uses React Query for caching and state management

## Testing

⚠️ **No test infrastructure is currently set up**. Do not add testing frameworks or write tests unless specifically requested.

## Deployment

The application can be deployed to:
- **Vercel** (recommended, auto-detects Vite)
- **Netlify**

Deployment steps are documented in `DEPLOYMENT_STEPS.md`.

### Build Output
- Build artifacts go to `dist/` directory (already in `.gitignore`)
- Vite generates optimized production bundles

## Contribution Guidelines

### When Making Changes
1. **Minimal modifications**: Only change what's necessary to fix the issue
2. **Preserve existing behavior**: Don't break working functionality
3. **Run linter**: Check your changes with `npm run lint`
4. **Test locally**: Run `npm run dev` and verify changes work
5. **Build verification**: Run `npm run build` to ensure production build works

### Code Changes
- Do NOT fix unrelated linting errors or bugs
- Do NOT remove or modify working code unless absolutely necessary
- Keep changes surgical and focused on the specific issue
- Match existing code style and patterns in the file you're editing

### Dependencies
- Use npm (not yarn or pnpm)
- Before adding dependencies, check if similar functionality exists
- Security: Always check new dependencies for vulnerabilities

### Git Commits
- Commits are managed automatically by the report_progress tool
- Write clear, descriptive commit messages
- Reference issue numbers in commit messages when applicable

## Known Issues and Constraints

1. **Existing linting errors**: The codebase has some TypeScript `any` usage and React Hook dependency warnings. These are not your responsibility to fix unless directly related to your changes.

2. **No testing framework**: There's no test infrastructure. Don't add tests unless specifically requested.

3. **Security vulnerabilities**: There are 2 moderate severity vulnerabilities in dependencies (run `npm audit` for details). Address these only if they affect your changes.

4. **Environment variables**: Some secrets are exposed in deployment documentation. Do not add actual secrets to any files in the repository.

## Additional Documentation

- `DEPLOYMENT_STEPS.md` - Deployment guide for Vercel/Netlify
- `STRIPE_INTEGRATION_GUIDE.md` - Payment integration documentation
- `WEBHOOK_SETUP.md` - Webhook configuration
- `deployment-guide.md` - Additional deployment information
- `README_PATCH.md` - Patch notes for the README

## Technology Stack Details

### UI Components
- **shadcn/ui**: Component system built on Radix UI
- **Radix UI**: Unstyled, accessible component primitives
- **Lucide React**: Icon library
- **Sonner**: Toast notifications
- **Vaul**: Drawer component
- **cmdk**: Command palette component

### Forms and Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Form validation integration

### Utilities
- **date-fns**: Date manipulation
- **uuid**: UUID generation
- **marked**: Markdown parsing
- **highlight.js**: Syntax highlighting
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Tailwind class merging utility

## Important Notes for Copilot

- This is an active project with existing issues and technical debt
- Focus on the specific task at hand, don't try to refactor or improve unrelated code
- The application uses Supabase for backend, so database changes require Supabase migrations
- Authentication flows use Supabase Auth, don't implement custom auth
- Follow the existing component patterns - most components are in `/src/components`
- Use existing utility functions from `/src/lib` when available
