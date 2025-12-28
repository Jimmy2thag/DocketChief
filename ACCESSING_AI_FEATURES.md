# 🤖 Accessing DocketChief with AI Agent Features

This guide explains how to access and use the latest version of DocketChief with built-in AI agent capabilities.

## 🌐 Access the Live Production Application

The easiest way to experience DocketChief with AI features is through our live production deployment:

**Production URL:** [https://docketchief.netlify.app](https://docketchief.netlify.app)

### Available AI Features

The production application includes:
- **AI Legal Assistant** - Powered by GPT-4 and Gemini Pro
- **Document Analysis** - AI-powered document processing and insights
- **Legal Research** - Integrated AI research capabilities
- **Brief Generation** - AI-assisted legal brief creation
- **Citation Formatting** - Automated legal citation tools

### Using the AI Assistant

1. Visit [https://docketchief.netlify.app](https://docketchief.netlify.app)
2. Create an account or sign in
3. Navigate to the **AI Assistant** section from the main dashboard
4. Choose between GPT-4 or Gemini Pro as your AI provider
5. Start asking legal research questions or request document analysis

## 💻 Local Development Setup

To run the latest code with AI features on your local machine:

### Prerequisites

- **Node.js 20+** (required)
- **npm 10+** (required)
- **Git** (required)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Jimmy2thag/DocketChief.git
cd DocketChief

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Start the development server
npm run dev

# The app will be available at http://localhost:5173
```

### Environment Configuration

To enable AI features locally, configure your `.env.local` file:

```bash
# Required - Supabase Backend
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional - For full AI functionality
VITE_ENVIRONMENT=development

# AI services are configured through Supabase Edge Functions
# Contact the repository maintainer for API key setup
```

## 🌿 Repository Branches

The DocketChief repository uses the following branch structure:

### Main Branches

| Branch | Purpose | Deployment | AI Features |
|--------|---------|------------|-------------|
| `main` | Production-ready code | [docketchief.netlify.app](https://docketchief.netlify.app) | ✅ Full AI |
| `develop` | Staging/development | Staging site | ✅ Full AI |
| Feature branches | Active development | Preview deployments | ✅ Full AI |

### Accessing Specific Versions

```bash
# Get the latest production code (main branch)
git clone https://github.com/Jimmy2thag/DocketChief.git
cd DocketChief
git checkout main

# Get the latest development code
git checkout develop

# See all available branches
git branch -a
```

## 🔑 AI Features Architecture

### Components

The AI features are implemented using:

**Frontend Components:**
- `src/components/AIChat.tsx` - Main AI assistant interface
- `src/components/DocumentAnalyzer.tsx` - Document analysis tool
- `src/lib/aiService.ts` - AI service integration layer

**Backend:**
- Supabase Edge Functions (`supabase/functions/legal-ai-chat`)
- Integration with OpenAI (GPT-4) and Google Gemini APIs

### Available AI Providers

The application supports multiple AI providers:

1. **GPT-4** (OpenAI) - Default provider
   - Best for: Detailed legal analysis, complex reasoning
   - Model: `gpt-4o`

2. **Gemini Pro** (Google) - Alternative provider
   - Best for: Fast responses, general legal queries
   - Model: `gemini-pro`

## 🚀 Deployment Options

### Option 1: Use Production (Recommended)

Simply use the live application at [https://docketchief.netlify.app](https://docketchief.netlify.app)

**Advantages:**
- No setup required
- Always up-to-date
- Full AI capabilities enabled
- Professional hosting and monitoring

### Option 2: Deploy Your Own Instance

If you need a custom deployment:

1. **Fork the repository** on GitHub
2. **Connect to Netlify:**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Initialize site
   netlify init
   ```

3. **Configure environment variables** in Netlify dashboard
4. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

See [.github/DEPLOYMENT_SETUP.md](.github/DEPLOYMENT_SETUP.md) for detailed deployment instructions.

### Option 3: Run Locally

Follow the [Local Development Setup](#local-development-setup) instructions above.

## 📚 Additional Resources

### Documentation

- [Main README](README.md) - Project overview
- [Deployment Guide](.github/DEPLOYMENT_SETUP.md) - Complete deployment instructions
- [CI/CD Customization](.github/CI_CD_CUSTOMIZATION.md) - Workflow configuration
- [E2E Testing Guide](.github/E2E_TESTING_GUIDE.md) - Testing documentation

### AI Feature Documentation

- **AI Service Code:** [`src/lib/aiService.ts`](src/lib/aiService.ts)
- **AI Chat UI:** [`src/components/AIChat.tsx`](src/components/AIChat.tsx)
- **Document Analyzer:** [`src/components/DocumentAnalyzer.tsx`](src/components/DocumentAnalyzer.tsx)

### Getting Help

- **Issues:** [GitHub Issues](https://github.com/Jimmy2thag/DocketChief/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Jimmy2thag/DocketChief/discussions)
- **Live App:** [https://docketchief.netlify.app](https://docketchief.netlify.app)

## 🔒 Security & API Keys

### For Production Use

The production deployment at [docketchief.netlify.app](https://docketchief.netlify.app) has all necessary API keys configured securely.

### For Local Development

To use AI features locally, you'll need:

1. **Supabase Project** - Create at [supabase.com](https://supabase.com)
2. **AI API Keys** - Configure in Supabase Edge Functions:
   - OpenAI API key (for GPT-4)
   - Google Cloud API key (for Gemini Pro)

**Important:** Never commit API keys to the repository. Use environment variables and `.env.local` (which is gitignored).

## 📊 Feature Status

| Feature | Status | Available In |
|---------|--------|--------------|
| AI Legal Assistant | ✅ Production | Main, Develop |
| GPT-4 Integration | ✅ Production | Main, Develop |
| Gemini Pro Integration | ✅ Production | Main, Develop |
| Document Analysis | ✅ Production | Main, Develop |
| Legal Research Tools | ✅ Production | Main, Develop |
| Case Management | ✅ Production | Main, Develop |
| Client Portal | ✅ Production | Main, Develop |

## 🎯 Quick Reference

### Access Production App
```
https://docketchief.netlify.app
```

### Clone and Run Locally
```bash
git clone https://github.com/Jimmy2thag/DocketChief.git
cd DocketChief
npm install
cp .env.example .env.local
# Configure .env.local with your credentials
npm run dev
```

### Check for Updates
```bash
cd DocketChief
git fetch origin
git checkout main
git pull origin main
npm install  # Update dependencies if needed
```

---

**Last Updated:** November 2024  
**Repository:** [Jimmy2thag/DocketChief](https://github.com/Jimmy2thag/DocketChief)  
**Live Demo:** [docketchief.netlify.app](https://docketchief.netlify.app)
