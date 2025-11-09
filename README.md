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

