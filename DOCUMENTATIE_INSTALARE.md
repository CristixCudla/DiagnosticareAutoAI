# Documentație Instalare și Configurare Aplicație
## Sistem de Diagnosticare Auto cu AI

---

## Cuprins
1. [Cerințe de Sistem](#cerințe-de-sistem)
2. [Instalare Dependențe](#instalare-dependențe)
3. [Configurare Baza de Date](#configurare-baza-de-date)
4. [Configurare Environment Variables](#configurare-environment-variables)
5. [Pornire Aplicație](#pornire-aplicație)
6. [Troubleshooting](#troubleshooting)

---

## 1. Cerințe de Sistem

### Software Necesar
- **Node.js**: versiunea 18.17.0 sau mai recentă
- **npm**: versiunea 9.0.0 sau mai recentă (vine cu Node.js)
- **Git**: pentru clonarea repository-ului
- **Browser modern**: Chrome, Firefox, Safari sau Edge (versiune recentă)

### Verificare versiuni
\`\`\`bash
node --version  # Trebuie să fie >= 18.17.0
npm --version   # Trebuie să fie >= 9.0.0
git --version   # Orice versiune recentă
\`\`\`

---

## 2. Instalare Dependențe

### Pasul 1: Clonare Repository
\`\`\`bash
# Clonează repository-ul
git clone [URL_REPOSITORY]

# Intră în directorul proiectului
cd [nume-proiect]
\`\`\`

### Pasul 2: Instalare Pachete npm
\`\`\`bash
# Instalează toate dependențele
npm install

# Sau folosind yarn (alternativ)
yarn install
\`\`\`

**Pachete principale instalate:**
- Next.js 16 (framework React)
- Supabase (autentificare și bază de date)
- Groq AI (pentru diagnosticare AI)
- Winston (sistem de loguri)
- Tailwind CSS (styling)
- Zod (validare)

---

## 3. Configurare Bază de Date

### Pasul 1: Creare Cont Supabase
1. Accesează [supabase.com](https://supabase.com)
2. Creează un cont gratuit
3. Creează un nou proiect
4. Notează URL-ul proiectului și API Keys

### Pasul 2: Rulare Scripturi SQL

Accesează **SQL Editor** în Supabase Dashboard și rulează scripturile în ordine:

#### Script 1: Tabela Profiles
\`\`\`sql
-- Fișier: scripts/001_create_users_and_profiles.sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Trigger pentru sincronizare cu auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
\`\`\`

#### Script 2: Tabela Subscriptions
\`\`\`sql
-- Fișier: scripts/002_create_subscriptions.sql
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tier TEXT CHECK (tier IN ('free', 'standard', 'premium')) DEFAULT 'free',
  is_active BOOLEAN DEFAULT TRUE,
  free_diagnostics_used INTEGER DEFAULT 0,
  free_diagnostics_limit INTEGER DEFAULT 15,
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- Trigger pentru creare abonament automat
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, tier, is_active)
  VALUES (NEW.id, 'free', TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- RLS Policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);
\`\`\`

#### Script 3: Tabela Diagnostics
\`\`\`sql
-- Fișier: scripts/003_create_diagnostics.sql
CREATE TABLE IF NOT EXISTS public.diagnostics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  symptoms TEXT NOT NULL,
  ai_diagnosis TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  estimated_cost TEXT,
  ai_recommendations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexuri pentru performanță
CREATE INDEX IF NOT EXISTS idx_diagnostics_user_id ON public.diagnostics(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_created_at ON public.diagnostics(created_at DESC);

-- RLS Policies
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diagnostics"
  ON public.diagnostics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnostics"
  ON public.diagnostics FOR INSERT
  WITH CHECK (auth.uid() = user_id);
\`\`\`

#### Script 4: Soft Delete (Opțional)
\`\`\`sql
-- Fișier: scripts/009_add_soft_delete_columns.sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_deleted_at ON public.subscriptions(deleted_at);
\`\`\`

#### Script 5: Admin User (Obligatoriu)
\`\`\`sql
-- Setează utilizatorul curent ca admin
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email = 'email-ul-tau@example.com';
\`\`\`

---

## 4. Configurare Environment Variables

### Pasul 1: Creare Fișier .env.local
Creează un fișier `.env.local` în root-ul proiectului:

\`\`\`bash
# În directorul proiectului
touch .env.local
\`\`\`

### Pasul 2: Adăugare Variabile
Deschide `.env.local` și adaugă următoarele variabile:

\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Development Redirect (pentru email verification)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Groq AI API Key (pentru diagnosticare)
API_KEY_GROQ_API_KEY=your-groq-api-key

# Stripe (opțional, pentru plăți)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Logging Level (opțional)
LOG_LEVEL=info
\`\`\`

### Unde găsești valorile:

#### Supabase Keys:
1. Du-te în **Supabase Dashboard** → **Settings** → **API**
2. Copiază:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY)

#### Groq API Key:
1. Creează cont pe [console.groq.com](https://console.groq.com)
2. Generează un API key gratuit
3. Copiază key-ul în API_KEY_GROQ_API_KEY

#### Stripe (opțional):
1. Creează cont pe [stripe.com](https://stripe.com)
2. Din Dashboard, copiază Test Mode keys

---

## 5. Pornire Aplicație

### Development Mode (Recomandabil pentru testare)
\`\`\`bash
# Pornește serverul de development
npm run dev

# Aplicația va fi disponibilă la:
# http://localhost:3000
\`\`\`

### Production Build
\`\`\`bash
# Build pentru producție
npm run build

# Pornește serverul de producție
npm start
\`\`\`

### Verificare Funcționalitate
1. **Pagina Principală**: http://localhost:3000
2. **Login**: http://localhost:3000/auth/login
3. **Înregistrare**: http://localhost:3000/auth/sign-up
4. **Dashboard**: http://localhost:3000/dashboard (după login)
5. **Admin Panel**: http://localhost:3000/admin (doar pentru admini)

---

## 6. Troubleshooting

### Problema: "Failed to load @supabase/ssr"
**Soluție:**
\`\`\`bash
npm install @supabase/ssr @supabase/supabase-js
npm run dev
\`\`\`

### Problema: "Could not find column deleted_at"
**Soluție:** Rulează scriptul SQL 009 pentru soft delete:
\`\`\`sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
\`\`\`

### Problema: "User authentication failed"
**Cauze posibile:**
1. Verifică că variabilele de mediu sunt corecte
2. Verifică că ai rulat toate scripturile SQL
3. Restart server: Ctrl+C și apoi `npm run dev`

### Problema: "Infinite redirect loop"
**Soluție:**
1. Șterge cookies din browser pentru localhost
2. Verifică middleware.ts
3. Restart browser

### Problema: Diagnosticul nu se generează
**Cauze posibile:**
1. Verifică API_KEY_GROQ_API_KEY în .env.local
2. Verifică că abonamentul este activ (tier nu este depășit)
3. Verifică logurile în `logs/app.log`

### Vizualizare Loguri
\`\`\`bash
# Vezi toate logurile
cat logs/app.log

# Vezi doar erorile
cat logs/error.log

# Urmărește logurile în timp real
tail -f logs/app.log
\`\`\`

---

## Structura Fișierelor Importante

\`\`\`
proiect/
├── app/                      # Next.js App Router
│   ├── actions/             # Server Actions
│   ├── admin/               # Panoul Admin
│   ├── auth/                # Autentificare
│   └── dashboard/           # Dashboard utilizator
├── components/              # Componente React
├── lib/
│   ├── supabase/           # Configurare Supabase
│   ├── logging/            # Sistem de loguri Winston
│   └── di/                 # Dependency Injection
├── scripts/                 # Scripturi SQL pentru DB
├── logs/                    # Fișiere de log (generate automat)
├── .env.local              # Variabile de mediu (CREEAZĂ MANUAL)
└── package.json            # Dependențe npm
\`\`\`

---

## Contact și Suport

Pentru probleme suplimentare:
1. Verifică documentația completă în `DOCUMENTATIE_APLICATIE.md`
2. Verifică logurile din `logs/app.log` și `logs/error.log`
3. Contactează echipa de development

**Versiune:** 1.0.0  
**Data ultimei actualizări:** Ianuarie 2025
