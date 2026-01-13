# 🎯 GHID RAPID PENTRU EVALUARE
**Aplicație: CarDiagnostic AI - Sistem de Diagnosticare Auto cu AI**

Acest document te ajută să răspunzi rapid la întrebări despre aplicație în timpul evaluării.

---

## 📋 UNDE SĂ CAUȚI INFORMAȚII

### 🗂️ STRUCTURA PROIECTULUI

\`\`\`
proiect-master/
├── app/                          # Frontend (Next.js Pages)
│   ├── actions/                  # API/Backend Logic (Server Actions)
│   ├── admin/                    # Panoul Admin (CRUD)
│   ├── auth/                     # Autentificare
│   ├── dashboard/                # Dashboard utilizator
│   └── page.tsx                  # Homepage
├── lib/
│   ├── services/                 # Business Logic Layer
│   ├── models/                   # ORM Layer
│   ├── di/                       # Dependency Injection
│   └── logging/                  # Sistem de Logging
├── scripts/                      # SQL pentru baza de date
└── components/                   # Componente React reutilizabile
\`\`\`

---

## 🗄️ BAZA DE DATE

### **Tabele Principale (3 entități cu relații)**

#### 1️⃣ **PROFILES** (Utilizatori)
\`\`\`sql
Locație: scripts/001_create_users_and_profiles.sql
\`\`\`

**Coloane importante:**
- `id` - UUID (PK, FK cu auth.users)
- `email` - Email utilizator
- `full_name` - Nume complet
- `is_admin` - Boolean (true = admin)
- `subscription_tier` - Enum: 'free', 'standard', 'premium'
- `deleted_at` - Timestamp (pentru soft delete)

**Relații:**
- ONE-TO-MANY cu `diagnostics` (un user → multe diagnostice)
- ONE-TO-MANY cu `subscriptions` (un user → multe abonamente)

#### 2️⃣ **SUBSCRIPTIONS** (Abonamente)
\`\`\`sql
Locație: scripts/002_create_subscriptions.sql
\`\`\`

**Coloane importante:**
- `id` - UUID (PK)
- `user_id` - UUID (FK → profiles.id)
- `tier` - Enum: 'free', 'standard', 'premium'
- `status` - Enum: 'active', 'cancelled', 'expired'
- `stripe_subscription_id` - String
- `deleted_at` - Timestamp (pentru soft delete)

**Relații:**
- MANY-TO-ONE cu `profiles` (multe abonamente ← un user)

#### 3️⃣ **DIAGNOSTICS** (Diagnostice Auto)
\`\`\`sql
Locație: scripts/003_create_diagnostics.sql
\`\`\`

**Coloane importante:**
- `id` - UUID (PK)
- `user_id` - UUID (FK → auth.users)
- `vehicle_make` - String (marca auto)
- `vehicle_model` - String (model auto)
- `vehicle_year` - Integer (an fabricație)
- `symptoms` - Text (simptomele introduse)
- `ai_diagnosis` - Text (diagnosticul AI)
- `severity` - String (low/medium/high)
- `estimated_cost` - String (cost estimat în RON)

**Relații:**
- MANY-TO-ONE cu `profiles` (multe diagnostice ← un user)

**IMPORTANT:** Nu are `deleted_at` - folosește **Hard Delete** (ștergere fizică)

---

## 🔧 BACKEND (API/Server Actions)

### **Unde sunt API-urile?**
\`\`\`
app/actions/ - Toate funcțiile backend (Server Actions Next.js)
\`\`\`

### **Fișiere Backend principale:**

#### 1️⃣ **auth-actions.ts** - Autentificare
**Funcții importante:**
- `signIn(email, password)` - Login
- `signUp(email, password, fullName)` - Înregistrare
- `signOut()` - Logout
- `sendPasswordResetEmail(email)` - Resetare parolă

**Unde se apelează:** 
- `app/auth/login/page.tsx` - pagina de login
- `app/auth/sign-up/page.tsx` - pagina de înregistrare

#### 2️⃣ **diagnostic-actions.ts** - Diagnosticare AI
**Funcții importante:**
- `generateDiagnosis(symptoms, vehicleInfo, requestImage)` - Generează diagnostic cu AI
- `getUserDiagnostics(userId)` - Lista diagnostice utilizator
- `getSubscriptionStatus(userId)` - Verifică abonament

**Unde se apelează:**
- `app/dashboard/page.tsx` - dashboard utilizator
- `components/diagnostic-form.tsx` - formularul de diagnosticare

**Cum funcționează:**
1. User completează simptomele auto în formular
2. Se apelează `generateDiagnosis()` care folosește Groq AI
3. AI returnează diagnostic, severitate, cost estimat, recomandări
4. Dacă e bifat checkbox, generează și imagine cu piesa afectată
5. Se salvează în tabelul `diagnostics`

#### 3️⃣ **admin-crud-actions.ts** - Panoul Admin
**Funcții CRUD:**

**USERS:**
- `getAllUsers()` - Listează toți userii (cu cache)
- `updateUser(userId, data)` - Update user
- `deleteUser(userId)` - **SOFT DELETE** (setează deleted_at)

**SUBSCRIPTIONS:**
- `getAllSubscriptions()` - Listează abonamente (cu cache)
- `updateSubscription(id, data)` - Update abonament
- `deleteSubscription(id)` - **SOFT DELETE** (setează deleted_at)

**DIAGNOSTICS:**
- `getAllDiagnostics()` - Listează diagnostice (cu cache)
- `updateDiagnostic(id, data)` - Update diagnostic
- `deleteDiagnostic(id)` - **HARD DELETE** (ștergere fizică)

**STATS:**
- `getAdminStats()` - Statistici admin (cu cache)

**Unde se apelează:**
- `app/admin/users/page.tsx` - gestiune useri
- `app/admin/subscriptions/page.tsx` - gestiune abonamente
- `app/admin/diagnostics/page.tsx` - gestiune diagnostice

---

## 🎨 FRONTEND (UI/Componente)

### **Pagini principale:**

#### **Homepage** - `app/page.tsx`
- Pagina de landing cu hero, features, pricing
- Link-uri către login și sign-up

#### **Dashboard** - `app/dashboard/page.tsx`
- Pagina principală utilizator autentificat
- Formular diagnosticare (`<DiagnosticForm />`)
- Istoric diagnostice (`<DiagnosticHistory />`)

#### **Panou Admin** - `app/admin/`
- **Users:** `app/admin/users/page.tsx`
- **Subscriptions:** `app/admin/subscriptions/page.tsx`
- **Diagnostics:** `app/admin/diagnostics/page.tsx`

### **Componente importante:**

\`\`\`
components/
├── diagnostic-form.tsx         # Formular diagnosticare AI
├── diagnostic-result.tsx       # Afișare rezultat diagnostic
├── diagnostic-history.tsx      # Istoric diagnostice
└── admin/
    ├── user-management-table.tsx
    ├── subscription-management-table.tsx
    └── diagnostics-management-table.tsx
\`\`\`

---

## 🏗️ ARHITECTURA (MVC)

### **Model Layer** - `lib/models/`
\`\`\`typescript
BaseModel           # Clasa de bază ORM cu CRUD generic
├── UserModel       # ORM pentru users/profiles
├── DiagnosticModel # ORM pentru diagnostics
└── SubscriptionModel # ORM pentru subscriptions
\`\`\`

**Ce fac:**
- Abstractizează accesul la baza de date
- Operații CRUD generice: findAll(), findById(), create(), update(), delete()
- Queries personalizate pe tabel

### **Service Layer** - `lib/services/`
\`\`\`typescript
UserService         # Logică business pentru useri
DiagnosticService   # Logică business pentru diagnostice
SubscriptionService # Logică business pentru abonamente
CacheService        # Memory cache (Lab 12)
Logger              # Sistem logging (Lab 11)
\`\`\`

**Ce fac:**
- Business logic complexă
- Validări
- Coordonează între models
- Folosesc cache pentru optimizare

### **Controller Layer** - `app/actions/`
Server Actions care:
- Primesc input de la frontend
- Validează date
- Apelează Services/Models
- Returnează răspunsuri

---

## 🔑 FUNCȚIONALITĂȚI CHEIE

### **1. Dependency Injection (Lab 10)**
\`\`\`typescript
Locație: lib/di/container.ts
\`\`\`

**Strategii disponibile:**
- **SINGLETON** - O singură instanță pentru întreaga aplicație
- **SCOPED** - O instanță per request
- **TRANSIENT** - Instanță nouă la fiecare apel

**Cum să comiți:** Editează `lib/di/configurator.ts` și decomentează strategia dorită.

### **2. Memory Cache (Lab 12)**
\`\`\`typescript
Locație: lib/services/cache.service.ts
\`\`\`

**Metode importante:**
- `get(key)` - Citește din cache
- `set(key, value, ttl)` - Scrie în cache cu TTL
- `remove(key)` - Șterge din cache
- `removeByPattern(pattern)` - Șterge multiple chei (ex: "user:*")
- `clear()` - Șterge tot cache-ul

**Unde e folosit:**
- `getAllUsers()` - Cache 5 min
- `getAllSubscriptions()` - Cache 5 min
- `getAllDiagnostics()` - Cache 3 min
- `getAdminStats()` - Cache 10 min

### **3. Logging System (Lab 11)**
\`\`\`typescript
Locație: lib/logging/logger.config.ts
\`\`\`

**Folosit în:**
- Toate operațiile CRUD (info, error)
- Autentificare (info, error)
- Diagnosticare AI (info, warn, error)

**Console.log pentru debugging:**
- Toate Server Actions folosesc `console.log()` pentru tracing

### **4. Soft Delete vs Hard Delete (Lab 9)**

**SOFT DELETE (setează deleted_at):**
- ✅ Users/Profiles - păstrează istoric
- ✅ Subscriptions - păstrează istoric plăți

**HARD DELETE (ștergere fizică):**
- ✅ Diagnostics - nu sunt chei străine

**Cum funcționează:**
- Soft: `UPDATE table SET deleted_at = NOW() WHERE id = ?`
- Hard: `DELETE FROM table WHERE id = ?`
- Toate query-urile exclud înregistrările șterse: `.is("deleted_at", null)`

---

## 🤖 AI & TEHNOLOGII

### **Groq AI Integration**
\`\`\`typescript
Locație: app/actions/diagnostic-actions.ts
Funcție: generateDiagnosis()
\`\`\`

**Ce face:**
- Primește simptome + info vehicul
- Apelează Groq API (model: llama-3.3-70b-versatile)
- Returnează diagnostic în română cu:
  - Diagnostic complet
  - Severitate (low/medium/high)
  - Cost estimat în RON
  - Recomandări
  - Cauze posibile
  - Măsuri preventive
  - (opțional) Imagine cu piesa afectată

### **Supabase Integration**
- **Autentificare:** Supabase Auth
- **Baza de date:** PostgreSQL
- **Row Level Security (RLS):** Securitate la nivel de rând

### **Stripe Integration**
- **Abonamente:** Gestionare plăți recurente
- **Locație:** `app/actions/stripe-actions.ts`

---

## 📚 ÎNTREBĂRI FRECVENTE LA EVALUARE

### **Q: Unde este implementat ORM-ul?**
**A:** `lib/models/base.model.ts` - clasa BaseModel cu operații CRUD generice (findAll, findById, create, update, delete). Fiecare entitate (UserModel, DiagnosticModel, SubscriptionModel) extinde BaseModel.

### **Q: Cum funcționează cache-ul?**
**A:** `lib/services/cache.service.ts` - MemoryCacheService cu Map în memorie. Fiecare entry are TTL. Pattern-based invalidation cu `removeByPattern()`. Folosit în admin-crud-actions pentru liste useri/abonamente/diagnostice.

### **Q: Unde sunt relațiile între tabele?**
**A:** 
- Profiles (1) → Diagnostics (N) - foreign key user_id
- Profiles (1) → Subscriptions (N) - foreign key user_id
- Vezi scripts/001, 002, 003 pentru definițiile SQL

### **Q: Cum funcționează Dependency Injection?**
**A:** `lib/di/container.ts` - DIContainer cu register/resolve. Trei strategii: SINGLETON, SCOPED, TRANSIENT. Configurabil în `lib/di/configurator.ts`.

### **Q: Diferența între Soft Delete și Hard Delete?**
**A:** 
- **Soft:** Users & Subscriptions - setează `deleted_at`, păstrează date istoric
- **Hard:** Diagnostics - DELETE fizic din DB, nu au FK dependencies

### **Q: Unde este Business Logic?**
**A:** `lib/services/` - UserService, DiagnosticService, SubscriptionService. Conțin validări, logică complexă, coordonare între models.

### **Q: Cum se face diagnosticarea AI?**
**A:** 
1. User completează formular (`components/diagnostic-form.tsx`)
2. Se apelează `generateDiagnosis()` din `diagnostic-actions.ts`
3. Groq AI procesează simptomele
4. Răspuns în română cu diagnostic complet + cost în RON
5. Salvare în DB tabelul `diagnostics`

---

## 🎓 LABORATOARE IMPLEMENTATE

| Lab | Cerință | Fișier Principal | Status |
|-----|---------|-----------------|--------|
| **Lab 5** | MVC + Admin Panel | `app/admin/` | ✅ Complet |
| **Lab 6** | ORM | `lib/models/base.model.ts` | ✅ Complet |
| **Lab 7** | Services Layer | `lib/services/` | ✅ Complet |
| **Lab 9** | Soft/Hard Delete | `admin-crud-actions.ts` | ✅ Complet |
| **Lab 10** | Dependency Injection | `lib/di/container.ts` | ✅ Complet |
| **Lab 11** | Logging | `lib/logging/logger.config.ts` | ✅ Complet |
| **Lab 12** | Memory Cache | `lib/services/cache.service.ts` | ✅ Complet |

---

## 🔍 CĂUTARE RAPIDĂ

### **Caut informații despre...**

| Ce cauți | Unde să te uiți |
|----------|-----------------|
| **Structura DB** | `scripts/*.sql` |
| **API-uri/Backend** | `app/actions/*.ts` |
| **Pagini Frontend** | `app/**/page.tsx` |
| **Componente UI** | `components/*.tsx` |
| **Business Logic** | `lib/services/*.ts` |
| **ORM/Models** | `lib/models/*.ts` |
| **Cache** | `lib/services/cache.service.ts` |
| **Logging** | `lib/logging/logger.config.ts` |
| **DI Container** | `lib/di/container.ts` |
| **Autentificare** | `app/actions/auth-actions.ts` |
| **Admin CRUD** | `app/actions/admin-crud-actions.ts` |
| **Diagnosticare AI** | `app/actions/diagnostic-actions.ts` |
| **Documentație completă** | `DOCUMENTATIE_APLICATIE.md` |
| **Grila evaluare** | `VERIFICARE_GRILA_EVALUARE.md` |

---

## ⚡ COMENZI RAPIDE

### **Rulare aplicație:**
\`\`\`bash
npm run dev
\`\`\`

### **Acces aplicație:**
- **Homepage:** http://localhost:3000
- **Login:** http://localhost:3000/auth/login
- **Dashboard:** http://localhost:3000/dashboard
- **Admin:** http://localhost:3000/admin/users

### **SQL Scripts:**
Rulează în ordine:
1. `001_create_users_and_profiles.sql`
2. `002_create_subscriptions.sql`
3. `003_create_diagnostics.sql`
4. (opțional) `009_add_soft_delete_columns.sql`

### **Setare Admin:**
\`\`\`sql
UPDATE profiles SET is_admin = true WHERE email = 'cristian.cudla1@student.usv.ro';
\`\`\`

---

## 📞 SUPORT RAPID

**Dacă întreabă despre:**
- **Backend/API** → `app/actions/`
- **Frontend/UI** → `app/**/page.tsx` + `components/`
- **Baza de date** → `scripts/*.sql`
- **Arhitectură** → `lib/models/` + `lib/services/`
- **Funcționalități speciale** → `lib/di/`, `lib/logging/`, `lib/services/cache.service.ts`

**Documentații complete:**
- `DOCUMENTATIE_APLICATIE.md` - Tot despre aplicație
- `DOCUMENTATIE_LAB10.md` - Dependency Injection
- `DOCUMENTATIE_LAB11.md` - Logging System
- `DOCUMENTATIE_LAB12.md` - Memory Cache
- `VERIFICARE_GRILA_EVALUARE.md` - Verificare cerințe

---

## 🏆 PUNCTE FORTE DE MENȚIONAT

1. **Arhitectură MVC completă** cu separare clară Model-Service-Controller
2. **ORM generic** cu BaseModel pentru operații CRUD
3. **3 entități cu relații FK** (Users, Subscriptions, Diagnostics)
4. **Cache inteligent** cu pattern-based invalidation
5. **Logging complet** pe toate operațiile importante
6. **Dependency Injection** cu 3 strategii configurabile
7. **Soft Delete + Hard Delete** implementate corect
8. **AI Integration** cu Groq pentru diagnosticare în română
9. **Documentație excepțional de completă** (1194+ linii)
10. **Security:** RLS policies, validări, autentificare Supabase

---

**SUCCES LA EVALUARE! 🚀**
