# Copilot Coding Agent Instructions

## Project Overview
DocketChief is a comprehensive legal case management system built with React, TypeScript, and Vite. It includes features for case management, document analysis, calendar tracking, client portals, and legal research tools, all integrated with Supabase for backend services.

## Technology Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **UI Components**: Radix UI with Tailwind CSS
- **Backend**: Supabase (authentication, database, storage)
- **State Management**: React Context API with hooks
- **Routing**: React Router v6
- **Form Handling**: React Hook Form with Zod validation
- **Package Manager**: npm (version 10+)
- **Node Version**: 20.x

## Code Style and Standards

### TypeScript Guidelines
- Use TypeScript for all new code files (`.ts`, `.tsx`)
- The project has `noImplicitAny: false` configured, but prefer explicit typing when possible
- Avoid using `any` type - prefer `unknown` or proper typing
- Path aliases are configured: use `@/*` for imports from `src/` directory

### React Component Guidelines
- Use functional components with hooks
- Follow the existing pattern of creating components in `/src/components/`
- UI primitives are in `/src/components/ui/` - reuse existing components
- Use React Hook Form for forms with Zod schema validation
- Context providers are in `/src/contexts/`
- Custom hooks are in `/src/hooks/`

### Styling
- Use Tailwind CSS utility classes for styling
- Follow the existing Tailwind configuration in `tailwind.config.ts`
- UI components use `class-variance-authority` for variant management
- Use the `cn()` utility from `@/lib/utils` for conditional class names

### File Organization
```
src/
├── components/        # React components
│   └── ui/           # Reusable UI primitives (shadcn/ui components)
├── contexts/         # React Context providers
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and services
├── pages/            # Page components (route-level components)
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## Development Workflow

### Building and Testing
- **Install dependencies**: `npm install`
- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Build for development**: `npm run build:dev`
- **Run linter**: `npm run lint`
- **Preview production build**: `npm run preview`

### Linting
- ESLint is configured with TypeScript support
- Run `npm run lint` before committing changes
- The project uses flat config format (`eslint.config.js`)
- Fix linting errors when possible, especially `@typescript-eslint/no-explicit-any` errors

### Environment Variables
- Environment variables should be prefixed with `VITE_`
- Check `.env.example` for required environment variables
- Never commit actual `.env` files or secrets to the repository

## Important Constraints

### Do Not Modify
- `/src/components/ui/` - These are shadcn/ui components; only modify if absolutely necessary
- Build artifacts in `/dist/` directory
- `node_modules/` directory
- Deployment configuration files unless specifically requested (`netlify.toml`, `vercel.json`)

### Security
- Never expose API keys or secrets in code
- All Supabase operations should use the configured client from contexts
- Validate user input, especially in forms

### Dependencies
- Use existing dependencies when possible
- Check for security vulnerabilities before adding new packages
- The project uses specific versions - be cautious when updating major versions
- Current vulnerabilities (2 moderate) exist - address if related to your changes

## Supabase Integration
- Authentication is handled via `AuthContext`
- Database queries use `@supabase/supabase-js` client
- Follow existing patterns for Supabase operations in the codebase
- Real-time subscriptions use Supabase's real-time features

## Deployment
- The application is deployed to Vercel and/or Netlify
- Build command: `npm run build`
- Output directory: `dist`
- See `DEPLOYMENT_STEPS.md` for detailed deployment instructions

## Testing
- There is currently no automated test suite in the project
- Manual testing is required for changes
- Test in the browser using `npm run dev`
- Verify builds successfully with `npm run build`

## Common Patterns

### Adding a New Component
1. Create the component file in `/src/components/`
2. Use TypeScript with proper prop types
3. Import UI components from `/src/components/ui/`
4. Use Tailwind CSS for styling
5. Export the component as default

### Adding a New Page
1. Create the page component in `/src/pages/`
2. Add routing in the appropriate router configuration
3. Ensure proper authentication checks if needed
4. Follow existing page structure patterns

### Working with Forms
1. Use React Hook Form for form state management
2. Define Zod schema for validation
3. Use `@hookform/resolvers/zod` for integration
4. Follow existing form patterns in the codebase

## Pull Request Guidelines
- Keep changes focused and minimal
- Update documentation if adding new features
- Run linter and fix errors before submitting
- Ensure the build completes successfully
- Test changes manually in development mode

## Resources
- Main documentation is in markdown files at the root level
- Stripe integration guide: `STRIPE_INTEGRATION_GUIDE.md`
- Webhook setup: `WEBHOOK_SETUP.md`
- Deployment guide: `deployment-guide.md`
