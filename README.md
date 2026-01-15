# Proiect DiagnosticAutoAI

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

## 📋 Cuprins

- [Despre Proiect](#-despre-proiect)
- [Caracteristici](#-caracteristici)
- [Tech Stack](#-tech-stack)
- [Prerequisite](#-prerequisite)
- [Instalare](#-instalare)
- [Configurare](#-configurare)
- [Rulare în Dezvoltare](#-rulare-în-dezvoltare)
- [Build pentru Producție](#-build-pentru-producție)
- [Deploy](#-deploy)
- [Structura Proiectului](#-structura-proiectului)
- [Variabile de Mediu](#-variabile-de-mediu)
- [Scripts Disponibile](#-scripts-disponibile)
- [Contribuție](#-contribuție)
- [License](#-license)

---

## 🚀 Despre Proiect

O aplicație full-stack modernă construită cu Next.js 16, React 19 și TypeScript, care oferă o experiență rapidă și scalabilă pentru utilizatori. Proiectul integrează soluții enterprise-ready pentru autentificare, baze de date și procesare de plăți.

### 🎯 Scopul Aplicației

Această aplicație oferă o platformă completă care conectează utilizatorii cu funcționalități avansate, protejate de autentificare securizată și optimizată pentru performanță maximă.

---

## ✨ Caracteristici

- ⚡ **Next.js 16** - Framework React cu App Router și Server Components
- 🎨 **Tailwind CSS v4** - Styling modern și responsive cu design tokens
- 🎭 **shadcn/ui** - Componente UI de înaltă calitate și accesibile
- 🔐 **Supabase Auth** - Autentificare securizată cu email/password
- 💾 **PostgreSQL** - Bază de date relațională robustă via Supabase
- 💳 **Stripe Integration** - Procesare plăți și abonamente
- 🤖 **AI Integration** - Integrare cu Groq pentru capabilități AI
- 📊 **Vercel Analytics** - Monitorizare trafic și performanță
- 🌙 **Dark Mode** - Suport nativ pentru tema închisă
- 📱 **Responsive Design** - Optimizat pentru toate dispozitivele
- ⚡ **Turbopack** - Bundler ultra-rapid pentru dezvoltare
- 🔒 **Type Safety** - TypeScript pentru cod sigur și mențenabil

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

## 📦 Prerequisite

Asigură-te că ai instalate următoarele:

- **Node.js**: versiunea 18.17 sau mai recentă
- **npm**, **yarn**, sau **pnpm** pentru managementul pachetelor
- **Git** pentru control versiuni
- Conturi configurate pentru:
  - [Supabase](https://supabase.com/) - pentru baza de date și autentificare
  - [Stripe](https://stripe.com/) - pentru procesare plăți
  - [Groq](https://groq.com/) - pentru AI capabilities
  - [Vercel](https://vercel.com/) - pentru deployment (opțional)

---

## 📥 Instalare

### 1. Clonează repository-ul

```bash
git clone <repository-url>
cd proiect-master
```

### 2. Instalează dependențele

```bash
npm install
# sau
yarn install
# sau
pnpm install
```

---

## ⚙️ Configurare

### Variabile de Mediu

Creează un fișier `.env.local` în root-ul proiectului cu următoarele variabile:

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Supabase Database (Generat automat)
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

### Setup Baza de Date

1. Conectează-te la [Supabase Dashboard](https://app.supabase.com/)
2. Creează un nou proiect sau folosește unul existent
3. Rulează migrările din folderul `scripts/` (dacă există)
4. Configurează Row Level Security (RLS) policies pentru securitate

### Setup Stripe

1. Conectează-te la [Stripe Dashboard](https://dashboard.stripe.com/)
2. Obține cheile API din modul Developers
3. Configurează webhook-uri pentru evenimente (dacă e necesar)
4. Adaugă produse și prețuri în catalog

---

## 🚀 Rulare în Dezvoltare

```bash
npm run dev
# sau
yarn dev
# sau
pnpm dev
```

Deschide [http://localhost:3000](http://localhost:3000) în browser pentru a vizualiza aplicația.

---

## 🏗 Build pentru Producție

```bash
npm run build
npm start
```

Acest proces va:
1. Compila și optimiza aplicația
2. Genera pagini statice unde este posibil
3. Pregăti aplicația pentru deployment

---

## 🌐 Deploy

### Deploy pe Vercel (Recomandat)

Cea mai simplă metodă de deploy pentru aplicații Next.js:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Conectează repository-ul GitHub/GitLab/Bitbucket
2. Configurează variabilele de mediu în Vercel Dashboard
3. Deploy automat la fiecare push pe branch-ul principal

### Deploy manual

```bash
npm run build
```

Apoi deploy folderul `.next` pe orice platformă care suportă Node.js.

---

## 📁 Structura Proiectului

```
proiect-master/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout cu metadata și fonts
│   ├── page.tsx             # Homepage
│   └── globals.css          # Stiluri globale și design tokens
├── components/              # Componente React reutilizabile
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dropdown-menu.tsx
│       └── ...
├── hooks/                   # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                     # Utilități și configurări
│   └── utils.ts            # Helper functions (cn, etc.)
├── scripts/                 # Database migration scripts
├── public/                  # Static assets (images, fonts, icons)
├── next.config.mjs          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies și scripts
└── README.md               # Documentație proiect
```

---

## 🔐 Variabile de Mediu

### Variabile Publice (NEXT_PUBLIC_*)
Aceste variabile sunt expuse în browser:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Cheie publică Stripe
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - URL redirect pentru dev

### Variabile Private
Accesibile doar pe server (Server Components, API Routes):
- `SUPABASE_SERVICE_ROLE_KEY` - Acces admin la Supabase
- `STRIPE_SECRET_KEY` - Cheie secretă Stripe
- `API_KEY_GROQ_API_KEY` - Cheie API Groq

⚠️ **Nu expune niciodată variabilele private în cod client!**

---

## 📜 Scripts Disponibile

```bash
# Dezvoltare
npm run dev           # Start development server cu Turbopack

# Build
npm run build         # Build pentru producție
npm start             # Start production server

# Linting & Formatting
npm run lint          # Rulează ESLint
npm run lint:fix      # Fix automatic erori ESLint

# Type Checking
npm run type-check    # Verifică erorile TypeScript
```

---

## 🤝 Contribuție

Contribuțiile sunt binevenite! Pentru a contribui:

1. Fork repository-ul
2. Creează un branch pentru feature (`git checkout -b feature/AmazingFeature`)
3. Commit modificările (`git commit -m 'Add some AmazingFeature'`)
4. Push pe branch (`git push origin feature/AmazingFeature`)
5. Deschide un Pull Request

### Guidelines pentru Contribuție

- Urmează structura de cod existentă
- Scrie cod TypeScript type-safe
- Testează toate modificările înainte de PR
- Documentează funcțiile și componentele noi
- Folosește conventional commits

---

## 📄 License

Acest proiect este licențiat sub [MIT License](LICENSE).

---

## 📧 Contact & Support

Pentru întrebări, probleme sau sugestii:

- 🐛 [Raportează un bug](../../issues/new?template=bug_report.md)
- 💡 [Sugerează un feature](../../issues/new?template=feature_request.md)
- 📖 [Documentație Next.js](https://nextjs.org/docs)
- 💬 [Discord Community](https://discord.gg/nextjs)

---

## 🙏 Mulțumiri

- [Vercel](https://vercel.com/) - Pentru Next.js și hosting
- [shadcn](https://ui.shadcn.com/) - Pentru componentele UI
- [Supabase](https://supabase.com/) - Pentru backend și autentificare
- [Stripe](https://stripe.com/) - Pentru infrastructura de plăți

---

<div align="center">
  
  **Construit cu ❤️ de Cristian Cudla folosind Next.js**
  
  [⬆ Înapoi sus](#proiect-master)
  
</div>
