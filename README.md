# DocketChief

A comprehensive legal case management system with AI-powered document analysis, calendar management, and client collaboration tools.

## Features

- 📝 **Document Management** - Upload, organize, and analyze legal documents
- 🤖 **AI Legal Assistant** - Powered by GPT-4 and Gemini Pro for legal research and drafting
- 📅 **Calendar & Events** - Track deadlines, hearings, and important dates
- 📊 **Analytics Dashboard** - Monitor case metrics, subscriptions, and CLV
- 💳 **Payment Integration** - Stripe payment processing for subscriptions
- 📧 **Email Alerts** - Automated notifications for critical events
- 👥 **Client Portal** - Secure collaboration with clients
- 🔍 **Advanced Search** - Powerful search across documents and cases

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI Services**: OpenAI GPT-4, Google Gemini
- **Payments**: Stripe
- **Testing**: Vitest, Playwright, Testing Library
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10
- Supabase account
- OpenAI API key (optional, for AI features)
- Stripe account (optional, for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Jimmy2thag/DocketChief.git
cd DocketChief
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYMENTS_ENABLED=false
```

4. Start the development server:
```bash
npm run dev
```

Visit http://localhost:8080 to see the application.

## Testing

### Unit and Integration Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test
```

Run tests with UI:
```bash
npm run test:ui
```

Generate coverage report:
```bash
npm run test:coverage
```

Current test coverage: **93.68% statements**, **78.5% branches**

### E2E Tests

Install Playwright browsers (first time only):
```bash
npx playwright install
```

Run E2E tests:
```bash
npm run test:e2e
```

Run E2E tests with UI:
```bash
npm run test:e2e:ui
```

Run E2E tests in headed mode:
```bash
npm run test:e2e:headed
```

## Building for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
DocketChief/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── src/
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Core library functions
│   │   ├── aiService.ts
│   │   ├── emailService.ts
│   │   ├── stripeService.ts
│   │   └── supabase.ts
│   ├── pages/             # Page components
│   └── test/              # Test files
│       ├── unit/          # Unit tests
│       ├── integration/   # Integration tests
│       ├── e2e/           # E2E tests
│       └── mocks/         # Mock data and utilities
├── supabase/
│   └── functions/         # Supabase Edge Functions
│       └── legal-ai-chat/ # AI chat endpoint
├── coverage/              # Test coverage reports
├── playwright-report/     # E2E test reports
└── docs/                  # Additional documentation
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (watch mode) |
| `npm run test:run` | Run unit tests (single run) |
| `npm run test:ui` | Open Vitest UI |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:e2e:ui` | Open Playwright UI |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_PAYMENTS_ENABLED` | Enable Stripe payments | No |

## Documentation

- [API Documentation](./docs/API_DOCS.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [Testing Guide](./docs/TESTING_GUIDE.md)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test && npm run test:e2e`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Built with [React](https://react.dev/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Backend powered by [Supabase](https://supabase.com/)
- AI features by [OpenAI](https://openai.com/) and [Google Gemini](https://deepmind.google/technologies/gemini/)
