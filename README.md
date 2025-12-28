# Docket Chief

A comprehensive legal document management and AI-powered research platform.

## 🚀 Quick Start

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start development server
```

### Production
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing
```bash
npm run lint         # Run linter
npm run test:e2e     # Run E2E tests
```

## 📚 Documentation

### CI/CD & Deployment
- **[Quick Start Guide](QUICKSTART_CI_CD.md)** - Get started with CI/CD in 5 minutes
- **[CI/CD Setup](CI_CD_SETUP.md)** - Complete CI/CD configuration guide
- **[Secrets Template](SECRETS_TEMPLATE.md)** - GitHub secrets configuration template
- **[Deployment Steps](DEPLOYMENT_STEPS.md)** - Step-by-step deployment guide

### Testing & Monitoring
- **[E2E Testing Guide](E2E_TESTING.md)** - End-to-end testing with Playwright
- **[Monitoring Setup](MONITORING_SETUP.md)** - Production monitoring and alerting

### Features & Integration
- **[Stripe Integration](STRIPE_INTEGRATION_GUIDE.md)** - Payment integration guide
- **[Webhook Setup](WEBHOOK_SETUP.md)** - Webhook configuration
- **[Deployment Health Check](deployment-health-check.md)** - Health monitoring

## 🎯 Features

- **Document Management**: Upload, organize, and manage legal documents
- **AI-Powered Research**: Legal research and analysis tools
- **Case Management**: Track cases, deadlines, and tasks
- **Collaboration Tools**: Share and collaborate on documents
- **Email Integration**: Connect and manage emails
- **Calendar**: Schedule and track important dates
- **Analytics**: Dashboard and reporting
- **Subscription Management**: Payment and subscription handling

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Radix UI + Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **Deployment**: Netlify
- **Testing**: Playwright
- **CI/CD**: GitHub Actions

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME=Docket Chief
VITE_ENVIRONMENT=development
VITE_PAYMENTS_ENABLED=false
```

See [CI_CD_SETUP.md](CI_CD_SETUP.md) for detailed configuration instructions.

## 📦 Project Structure

```
docket-chief/
├── .github/workflows/    # GitHub Actions CI/CD
├── e2e/                  # E2E tests
├── public/               # Static assets
├── src/                  # Source code
│   ├── components/       # React components
│   ├── lib/              # Utilities and libraries
│   └── main.tsx          # Application entry point
├── supabase/             # Supabase functions
└── docs/                 # Documentation
```

## 🚀 CI/CD Pipeline

The project includes automated CI/CD with:
- ✅ Linting and code quality checks
- ✅ Production builds
- ✅ E2E tests across multiple browsers
- ✅ Automated deployment to Netlify
- ✅ Post-deployment health checks
- ✅ Automatic issue creation on failures

See [QUICKSTART_CI_CD.md](QUICKSTART_CI_CD.md) to get started.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:e2e`
5. Submit a pull request

## 📄 License

See LICENSE file for details.

## 🆘 Support

- Check the [documentation](CI_CD_SETUP.md)
- Review [troubleshooting guides](E2E_TESTING.md#troubleshooting)
- Open an issue for bugs or questions

# DocketChief - Legal Practice Management System

🚀 **Now Live:** [https://docketchief.netlify.app](https://docketchief.netlify.app)

📘 **[How to Access the AI Agent Features →](ACCESSING_AI_FEATURES.md)**

## Overview

DocketChief is a comprehensive legal practice management application built with React, TypeScript, and Supabase. It provides lawyers and legal professionals with tools for case management, document analysis, legal research, and client collaboration.

## Features

- ⚖️ **Case Management** - Organize and track legal cases
- 📄 **Document Analysis** - AI-powered document processing
- 🔍 **Legal Research** - Integrated search across Google Scholar (Federal & State Courts), CourtListener, and other legal databases
- 📅 **Calendar & Deadlines** - Never miss important dates
- 💬 **Client Portal** - Secure client communication
- 📊 **Analytics Dashboard** - Track practice metrics
- 🤖 **AI Assistant** - Legal research and brief generation

## Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Hosting:** Netlify with automatic deployments
- **Testing:** Playwright for E2E testing
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry error tracking (configured)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run E2E tests
npm run test:e2e
```

## Deployment

This application uses automated CI/CD deployment:

- **Production:** `main` branch → [docketchief.netlify.app](https://docketchief.netlify.app)
- **Staging:** `develop` branch → staging site
- **Pull Requests:** Preview deployments with E2E testing

## Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
# Required for development
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ENVIRONMENT=development
```

## Documentation

- [Google Scholar Integration](docs/GOOGLE_SCHOLAR_INTEGRATION.md)
### Getting Started
- **[Accessing AI Features](ACCESSING_AI_FEATURES.md)** - How to use the latest code with AI agent capabilities

### Development & Deployment
- [Deployment Setup](.github/DEPLOYMENT_SETUP.md)
- [CI/CD Customization](.github/CI_CD_CUSTOMIZATION.md)
- [E2E Testing Guide](.github/E2E_TESTING_GUIDE.md)
- [Monitoring Setup](.github/MONITORING_SETUP.md)
- [Secrets Configuration](.github/SECRETS_SETUP.md)

---

**Status:** ✅ Production Ready | 🚀 Deployed with Full CI/CD | 📊 Monitored
