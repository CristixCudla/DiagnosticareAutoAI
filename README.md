# Master Project

<div align="center">
  <img src="/icon.svg" alt="Logo" width="100" height="100">
  
  **Next.js Full-Stack Application**
  
  [![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?logo=supabase)](https://supabase.com/)
  [![Stripe](https://img.shields.io/badge/Stripe-Payments-635bff?logo=stripe)](https://stripe.com/)
</div>

---

## 📋 Table of Contents

- [About Project](#-about-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running in Development](#-running-in-development)
- [Build for Production](#-build-for-production)
- [Deploy](#-deploy)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 About Project

A modern full-stack application built with Next.js 16, React 19, and TypeScript, providing a fast and scalable experience for users. The project integrates enterprise-ready solutions for authentication, databases, and payment processing.

### 🎯 Application Purpose

This application offers a complete platform that connects users with advanced features, protected by secure authentication and optimized for maximum performance.

---

## ✨ Features

- ⚡ **Next.js 16** - React framework with App Router and Server Components
- 🎨 **Tailwind CSS v4** - Modern and responsive styling with design tokens
- 🎭 **shadcn/ui** - High-quality and accessible UI components
- 🔐 **Supabase Auth** - Secure authentication with email/password
- 💾 **PostgreSQL** - Robust relational database via Supabase
- 💳 **Stripe Integration** - Payment processing and subscriptions
- 🤖 **AI Integration** - Integration with Groq for AI capabilities
- 📊 **Vercel Analytics** - Traffic and performance monitoring
- 🌙 **Dark Mode** - Native support for dark theme
- 📱 **Responsive Design** - Optimized for all devices
- ⚡ **Turbopack** - Ultra-fast bundler for development
- 🔒 **Type Safety** - TypeScript for safe and maintainable code

---

## 🛠 Tech Stack

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) (React 19.2)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Fonts:** Geist Sans & Geist Mono

### Backend & Services
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication:** Supabase Auth
- **Payments:** [Stripe](https://stripe.com/)
- **AI:** [Groq](https://groq.com/)
- **Analytics:** [Vercel Analytics](https://vercel.com/analytics)
- **Hosting:** [Vercel](https://vercel.com/)

---

## 📦 Prerequisites

Make sure you have the following installed:

- **Node.js**: version 18.17 or later
- **npm**, **yarn**, or **pnpm** for package management
- **Git** for version control
- Configured accounts for:
  - [Supabase](https://supabase.com/) - for database and authentication
  - [Stripe](https://stripe.com/) - for payment processing
  - [Groq](https://groq.com/) - for AI capabilities
  - [Vercel](https://vercel.com/) - for deployment (optional)

---

## 📥 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd master-project
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Supabase Database (Auto-generated)
SUPABASE_POSTGRES_URL=your_postgres_url
SUPABASE_POSTGRES_PRISMA_URL=your_postgres_prisma_url
SUPABASE_POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
SUPABASE_POSTGRES_USER=your_postgres_user
SUPABASE_POSTGRES_PASSWORD=your_postgres_password
SUPABASE_POSTGRES_DATABASE=your_postgres_database
SUPABASE_POSTGRES_HOST=your_postgres_host

# Stripe
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Groq AI
API_KEY_GROQ_API_KEY=your_groq_api_key
```

### Database Setup

1. Connect to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or use an existing one
3. Run migrations from the `scripts/` folder (if available)
4. Configure Row Level Security (RLS) policies for security

### Stripe Setup

1. Connect to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get API keys from the Developers module
3. Configure webhooks for events (if necessary)
4. Add products and prices to your catalog

---

## 🚀 Running in Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🏗 Build for Production

```bash
npm run build
npm start
```

This process will:
1. Compile and optimize the application
2. Generate static pages where possible
3. Prepare the application for deployment

---

## 🌐 Deploy

### Deploy to Vercel (Recommended)

The simplest way to deploy Next.js applications:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Connect your GitHub/GitLab/Bitbucket repository
2. Configure environment variables in Vercel Dashboard
3. Automatic deployment on each push to the main branch

### Manual Deploy

```bash
npm run build
```

Then deploy the `.next` folder to any Node.js-compatible platform.

---

## 📁 Project Structure

```
master-project/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with metadata and fonts
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles and design tokens
├── components/              # Reusable React components
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dropdown-menu.tsx
│       └── ...
├── hooks/                   # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                     # Utilities and configurations
│   └── utils.ts            # Helper functions (cn, etc.)
├── scripts/                 # Database migration scripts
├── public/                  # Static assets (images, fonts, icons)
├── next.config.mjs          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```

---

## 🔐 Environment Variables

### Public Variables (NEXT_PUBLIC_*)
These variables are exposed in the browser:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - Redirect URL for dev

### Private Variables
Accessible only on the server (Server Components, API Routes):
- `SUPABASE_SERVICE_ROLE_KEY` - Admin access to Supabase
- `STRIPE_SECRET_KEY` - Stripe secret key
- `API_KEY_GROQ_API_KEY` - Groq API key

⚠️ **Never expose private variables in client code!**

---

## 📜 Available Scripts

```bash
# Development
npm run dev           # Start development server with Turbopack

# Build
npm run build         # Build for production
npm start             # Start production server

# Linting & Formatting
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix ESLint errors

# Type Checking
npm run type-check    # Check TypeScript errors
```

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contributing Guidelines

- Follow the existing code structure
- Write type-safe TypeScript code
- Test all changes before submitting a PR
- Document new functions and components
- Use conventional commits

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 📧 Contact & Support

For questions, issues, or suggestions:

- 🐛 [Report a bug](../../issues/new?template=bug_report.md)
- 💡 [Suggest a feature](../../issues/new?template=feature_request.md)
- 📖 [Next.js Documentation](https://nextjs.org/docs)
- 💬 [Discord Community](https://discord.gg/nextjs)

---

## 🙏 Acknowledgments

- [Vercel](https://vercel.com/) - For Next.js and hosting
- [shadcn](https://ui.shadcn.com/) - For UI components
- [Supabase](https://supabase.com/) - For backend and authentication
- [Stripe](https://stripe.com/) - For payment infrastructure

---

<div align="center">
  
  **Built with ❤️ by Cristian Cudla using Next.js**
  
  [⬆ Back to top](#master-project)
  
</div>
