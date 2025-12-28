# DocketChief - Legal Practice Management System

🚀 **Now Live:** [https://docketchief.netlify.app](https://docketchief.netlify.app)

📘 **[How to Access the AI Agent Features →](ACCESSING_AI_FEATURES.md)**

## Overview

DocketChief is a comprehensive legal practice management application built with React, TypeScript, and Supabase. It provides lawyers and legal professionals with tools for case management, document analysis, legal research, and client collaboration.

## Features

- ⚖️ **Case Management** - Organize and track legal cases
- 📄 **Document Analysis** - AI-powered document processing
- 🔍 **Legal Research** - Integrated legal database search
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
