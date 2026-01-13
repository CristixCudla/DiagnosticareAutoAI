# Documentație Aplicație - Diagnosticare Auto cu AI

**Disciplina:** Paradigme de proiectare a aplicațiilor web  
**An universitar:** 2025-2026  
**Student:** Cristian Cudla  
**Email:** cristian.cudla1@student.usv.ro

---

## Cuprins

1. [Descrierea Aplicației](#1-descrierea-aplicației)
2. [Arhitectura Aplicației](#2-arhitectura-aplicației)
3. [Tehnologii Utilizate](#3-tehnologii-utilizate)
4. [Structura Bazei de Date](#4-structura-bazei-de-date)
5. [Implementare MVC](#5-implementare-mvc)
6. [ORM (Object-Relational Mapping)](#6-orm-object-relational-mapping)
7. [Services Layer](#7-services-layer)
8. [Funcționalități Complexe](#8-funcționalități-complexe)
9. [Secțiune Admin](#9-secțiune-admin)
10. [Secțiune Utilizator](#10-secțiune-utilizator)
11. [Integrări](#11-integrări)
12. [Instalare și Configurare](#12-instalare-și-configurare)

---

## 1. Descrierea Aplicației

### 1.1 Scopul Aplicației

Aplicația **Diagnosticare Auto cu AI** oferă utilizatorilor posibilitatea de a obține diagnostice detaliate pentru problemele auto folosind inteligența artificială. Sistemul include:

- **Free Trial**: 15 diagnosticări gratuite
- **Plan Standard**: Diagnosticări nelimitate cu analiză standard
- **Plan Premium**: Diagnosticări avansate cu recomandări detaliate

### 1.2 Funcționalități Principale

**Pentru Utilizatori:**
- Diagnosticare AI pentru probleme auto
- Istoric diagnosticări (limitat în funcție de plan)
- Gestionare abonament
- Plată recurentă prin Stripe

**Pentru Administratori:**
- Gestionare utilizatori (CRUD complet)
- Gestionare diagnosticări (CRUD complet)
- Gestionare abonamente
- Dashboard cu statistici

---

## 2. Arhitectura Aplicației

### 2.1 Paradigma MVC (Model-View-Controller)

Aplicația implementează paradigma MVC cu următoarele niveluri:

\`\`\`
┌─────────────────────────────────────────┐
│           VIEW (Components)              │
│  - React Components                      │
│  - UI Forms & Tables                     │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│      CONTROLLER (Server Actions)         │
│  - app/actions/*.ts                      │
│  - Business Logic Orchestration          │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│        SERVICES LAYER                    │
│  - lib/services/*.service.ts             │
│  - Business Logic                        │
│  - Caching & Logging                     │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│          MODEL (ORM)                     │
│  - lib/models/*.model.ts                 │
│  - Database Abstraction                  │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         DATABASE (Supabase)              │
│  - PostgreSQL                            │
│  - Row Level Security                    │
└─────────────────────────────────────────┘
\`\`\`

### 2.2 Dependency Injection

Serviciile folosesc Dependency Injection prin constructor:

\`\`\`typescript
export class UserService {
  constructor(
    private userModel: UserModel = new UserModel(),
    private subscriptionModel: SubscriptionModel = new SubscriptionModel()
  ) {}
}
\`\`\`

**Beneficii:**
- Testabilitate (mock dependencies în teste)
- Loose coupling între componente
- Flexibilitate în configurare

---

## 3. Tehnologii Utilizate

### 3.1 Frontend
- **Next.js 16** - Framework React cu App Router
- **React 19** - Library UI
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component library

### 3.2 Backend
- **Next.js Server Actions** - Server-side logic
- **Supabase** - Database PostgreSQL + Auth
- **AI SDK v5** - AI integration
- **Groq** - AI model provider

### 3.3 Plăți
- **Stripe** - Payment processing

---

## 4. Structura Bazei de Date

### 4.1 Entități Principale

#### **Profiles** (Utilizatori)
\`\`\`sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);
\`\`\`

#### **Subscriptions** (Abonamente)
\`\`\`sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id), -- Cheie străină
  tier TEXT CHECK (tier IN ('free', 'standard', 'premium')),
  is_active BOOLEAN DEFAULT TRUE,
  free_diagnostics_used INT DEFAULT 0,
  free_diagnostics_limit INT DEFAULT 15,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);
\`\`\`

#### **Diagnostics** (Diagnosticări)
\`\`\`sql
CREATE TABLE diagnostics (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id), -- Cheie străină
  vehicle_info JSONB,
  symptoms TEXT NOT NULL,
  diagnosis TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  estimated_cost TEXT,
  repair_steps TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);
\`\`\`

### 4.2 Relații

- `subscriptions.user_id → profiles.id` (One-to-One)
- `diagnostics.user_id → profiles.id` (One-to-Many)

### 4.3 Soft Delete

Toate tabelele au coloana `deleted_at` pentru ștergere logică:
- `NULL` = activ
- `TIMESTAMPTZ` = șters (păstrat pentru audit)

---

## 5. Implementare MVC

### 5.1 MODEL - ORM Classes

**Fișiere:** `lib/models/*.model.ts`

**BaseModel** - Clasa abstractă cu operații CRUD:

\`\`\`typescript
export abstract class BaseModel<T> {
  async findAll(): Promise<T[]>
  async findById(id: string): Promise<T | null>
  async create(data: Partial<T>): Promise<T | null>
  async update(id: string, data: Partial<T>): Promise<T | null>
  async softDelete(id: string): Promise<boolean>
  async hardDelete(id: string): Promise<boolean>
  async count(): Promise<number>
}
\`\`\`

**UserModel** - Extinde BaseModel:

\`\`\`typescript
export class UserModel extends BaseModel<User> {
  async findByEmail(email: string): Promise<User | null>
  async findAdmins(): Promise<User[]>
  async findWithSubscriptions(userId: string)
}
\`\`\`

### 5.2 VIEW - React Components

**Fișiere:** `components/**/*.tsx`

**Index View** - Listă utilizatori:
\`\`\`tsx
<UserManagementTable users={users} />
\`\`\`

**Details View** - Detalii utilizator:
\`\`\`tsx
<UserDetailsView user={user} />
\`\`\`

**Edit View** - Formular editare:
\`\`\`tsx
<UserEditForm user={user} />
\`\`\`

**Elemente UI:**
- Casete text: `<Input />`
- Liste selecție: `<Select />`
- Checkbox: `<Checkbox />`
- Tabele: `<Table />`

### 5.3 CONTROLLER - Server Actions

**Fișiere:** `app/actions/*.ts`

**Index Action** - GET listă utilizatori:
\`\`\`typescript
export async function getAllUsers() {
  const users = await userService.getAllActiveUsers()
  return { users }
}
\`\`\`

**Details Action** - GET detalii:
\`\`\`typescript
export async function getUserDetails(userId: string) {
  const user = await userService.getUserWithDetails(userId)
  return { user }
}
\`\`\`

**Edit Action** - POST actualizare:
\`\`\`typescript
export async function updateUser(userId: string, data: Partial<User>) {
  await userService.updateUser(userId, data)
  revalidatePath('/admin/users')
  return { success: true }
}
\`\`\`

**Delete Action** - DELETE soft:
\`\`\`typescript
export async function deleteUser(userId: string) {
  await userService.deleteUser(userId)
  revalidatePath('/admin/users')
  return { success: true }
}
\`\`\`

---

## 6. ORM (Object-Relational Mapping)

### 6.1 Beneficii ORM

- **Abstractizare**: Operații database prin metode TypeScript
- **Type Safety**: TypeScript checking pentru date
- **Reusabilitate**: Metode comune în BaseModel
- **Maintainability**: Un loc pentru logica database

### 6.2 Exemplu Utilizare

**Fără ORM** (direct Supabase):
\`\`\`typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
\`\`\`

**Cu ORM**:
\`\`\`typescript
const user = await userModel.findById(userId)
\`\`\`

### 6.3 Operații Suportate

| Operație | Metodă ORM | Descriere |
|----------|------------|-----------|
| **SELECT ALL** | `findAll()` | Toate înregistrările |
| **SELECT ONE** | `findById(id)` | O înregistrare |
| **INSERT** | `create(data)` | Creare nouă |
| **UPDATE** | `update(id, data)` | Actualizare |
| **SOFT DELETE** | `softDelete(id)` | Ștergere logică |
| **HARD DELETE** | `hardDelete(id)` | Ștergere fizică |
| **COUNT** | `count()` | Numărare |

---

## 7. Services Layer

### 7.1 Scopul Services Layer

Nivelul Services conține **logica de business** a aplicației:

- Validări business
- Orchestrare între modele
- Caching
- Logging
- Securitate

### 7.2 UserService

**Fișier:** `lib/services/user.service.ts`

**Business Logic Examples:**

\`\`\`typescript
// Validare email unic
async updateUser(userId: string, data: Partial<User>) {
  if (data.email) {
    const existing = await this.userModel.findByEmail(data.email)
    if (existing && existing.id !== userId) {
      throw new Error("Email already in use")
    }
  }
  return await this.userModel.update(userId, data)
}

// Validare ștergere cu abonament activ
async deleteUser(userId: string) {
  const subscription = await this.subscriptionModel.findByUser(userId)
  if (subscription?.is_active && subscription.tier !== 'free') {
    throw new Error("Cannot delete user with active paid subscription")
  }
  return await this.userModel.softDelete(userId)
}
\`\`\`

### 7.3 DiagnosticService

**Fișier:** `lib/services/diagnostic.service.ts`

**Logică Business Specifică:**

\`\`\`typescript
// Verificare permisiuni utilizator
async canUserDiagnose(userId: string) {
  const subscription = await subscriptionModel.findByUser(userId)
  
  if (subscription.tier === 'free') {
    const remaining = subscription.free_diagnostics_limit - 
                      subscription.free_diagnostics_used
    if (remaining <= 0) {
      return { can: false, reason: "Limit reached" }
    }
  }
  
  return { can: true }
}

// Generare prompt bazat pe tier
private buildPromptForTier(tier: string, vehicleInfo, symptoms) {
  if (tier === 'premium') {
    return `PREMIUM ANALYSIS - comprehensive diagnostic...`
  }
  if (tier === 'standard') {
    return `STANDARD ANALYSIS - thorough diagnostic...`
  }
  return `BASIC ANALYSIS - straightforward diagnostic...`
}
\`\`\`

### 7.4 Singleton Pattern

Toate serviciile sunt exportate ca singletons:

\`\`\`typescript
export const userService = new UserService()
export const diagnosticService = new DiagnosticService()
\`\`\`

**Beneficii:**
- O singură instanță în toată aplicația
- Memorie eficientă
- State partajat (cache)

---

## 8. Funcționalități Complexe

### 8.1 Caching System

**Fișier:** `lib/services/cache.service.ts`

**Implementare:**

\`\`\`typescript
export class CacheService {
  private memoryCache: Map<string, { data: any; expiry: number }>

  set(key: string, data: any, ttlSeconds: number) {
    const expiry = Date.now() + ttlSeconds * 1000
    this.memoryCache.set(key, { data, expiry })
  }

  get<T>(key: string): T | null {
    const cached = this.memoryCache.get(key)
    if (!cached || Date.now() > cached.expiry) {
      this.memoryCache.delete(key)
      return null
    }
    return cached.data as T
  }
}
\`\`\`

**Utilizare:**

\`\`\`typescript
async getAllActiveUsers() {
  const cacheKey = "users:active:all"
  const cached = cacheService.get<User[]>(cacheKey)
  
  if (cached) {
    logger.info("Users retrieved from cache")
    return cached
  }
  
  const users = await this.userModel.findAll()
  cacheService.set(cacheKey, users, 60) // Cache 1 min
  return users
}
\`\`\`

**Cache Keys Used:**
- `users:active:all` - Lista utilizatori (60s TTL)
- `user:{id}:details` - Detalii utilizator (30s TTL)
- `user:{id}:stats` - Statistici user (120s TTL)
- `diagnostics:user:{id}` - Diagnosticări user (60s TTL)
- `diagnostics:stats:global` - Statistici globale (300s TTL)

### 8.2 Logging System

**Fișier:** `lib/services/logger.service.ts`

**Singleton Logger:**

\`\`\`typescript
export class LoggerService {
  private static instance: LoggerService
  
  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService()
    }
    return LoggerService.instance
  }

  info(message: string, context?: any) {
    console.log(`[INFO] ${message}`, context)
  }

  error(message: string, error?: any, context?: any) {
    console.error(`[ERROR] ${message}`, { error, context })
  }

  warn(message: string, context?: any) {
    console.warn(`[WARN] ${message}`, context)
  }
}
\`\`\`

**Utilizare în aplicație:**

\`\`\`typescript
logger.info("User login", { userId, email })
logger.error("Failed to create diagnostic", error, { userId })
logger.warn("Cache miss for key", { key })
\`\`\`

**Log Locations:**
- Authentication events
- CRUD operations
- Cache hits/misses
- Business rule violations
- AI generation steps

### 8.3 Dependency Injection

**Pattern:**

\`\`\`typescript
export class UserService {
  constructor(
    private userModel: UserModel = new UserModel(),
    private subscriptionModel: SubscriptionModel = new SubscriptionModel()
  ) {}
}
\`\`\`

**Testing cu DI:**

\`\`\`typescript
// Test cu mock dependencies
const mockUserModel = {
  findById: jest.fn().mockResolvedValue(mockUser)
}
const service = new UserService(mockUserModel)
\`\`\`

**Beneficii:**
- Testare ușoară cu mocks
- Flexibilitate configurare
- Loose coupling

### 8.4 Soft Delete (Ștergere Logică)

**Implementare:**

\`\`\`typescript
async softDelete(id: string): Promise<boolean> {
  const { error } = await supabase
    .from(this.tableName)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
  
  return !error
}
\`\`\`

**Politici RLS:**

\`\`\`sql
CREATE POLICY "select_non_deleted"
  ON profiles FOR SELECT
  USING (deleted_at IS NULL);
\`\`\`

**Beneficii:**
- Audit trail complet
- Recuperare date șterse
- Compliance GDPR
- Debugging mai ușor

---

## 9. Secțiune Admin

### 9.1 Acces Admin

**Autorizare:**
\`\`\`typescript
export async function checkIsAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  return profile?.is_admin || false
}
\`\`\`

**Middleware Protection:**
\`\`\`typescript
export default async function AdminPage() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) redirect('/dashboard')
  // ... render admin content
}
\`\`\`

### 9.2 CRUD Utilizatori

**Operații Implementate:**

| Operație | Route | Descriere |
|----------|-------|-----------|
| **Index** | `/admin/users` | Listă toți utilizatorii |
| **Details** | `/admin/users/[id]` | Detalii + Edit form |
| **Create** | *N/A* | Prin sign-up |
| **Update** | `/admin/users/[id]` | POST edit form |
| **Delete** | `/admin/users/[id]` | Soft delete |

**Exemplu Index:**

\`\`\`tsx
// app/admin/users/page.tsx
export default async function UsersIndexPage() {
  const { users } = await getAllUsers()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Toți Utilizatorii ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <UserManagementTable users={users} />
      </CardContent>
    </Card>
  )
}
\`\`\`

**View Tabel:**

\`\`\`tsx
// components/admin/user-management-table.tsx
export function UserManagementTable({ users }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Tier</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge>{user.subscriptions[0]?.tier}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.is_admin ? "default" : "secondary"}>
                {user.is_admin ? "Admin" : "User"}
              </Badge>
            </TableCell>
            <TableCell>
              <Button asChild size="sm">
                <Link href={`/admin/users/${user.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleDelete(user.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
\`\`\`

### 9.3 CRUD Diagnosticări

**Operații:**

| Operație | Route | Descriere |
|----------|-------|-----------|
| **Index** | `/admin/diagnostics` | Listă toate diagnosticările |
| **Create** | `/admin/diagnostics/create` | Formular creare nouă |
| **Delete** | Action | Soft delete |

**Cheie Străină:**

Diagnostics.user_id → Profiles.id

**Create Form:**

\`\`\`tsx
// app/admin/diagnostics/create/page.tsx
<Select 
  value={userId} 
  onValueChange={setUserId}
>
  <SelectTrigger>
    <SelectValue placeholder="Selectează utilizator" />
  </SelectTrigger>
  <SelectContent>
    {users.map(user => (
      <SelectItem key={user.id} value={user.id}>
        {user.email}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
\`\`\`

### 9.4 Dashboard Admin

**Statistici Afișate:**

\`\`\`typescript
export async function getAdminStats() {
  return {
    stats: {
      totalUsers: 150,
      totalDiagnostics: 1250,
      recentDiagnostics: 87, // Last 7 days
      subscriptionStats: {
        free: 120,
        standard: 20,
        premium: 10
      },
      severityBreakdown: {
        low: 400,
        medium: 500,
        high: 250,
        critical: 100
      }
    }
  }
}
\`\`\`

**Dashboard UI:**

\`\`\`tsx
// app/admin/page.tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
  <Card>
    <CardHeader>
      <CardTitle>Total Utilizatori</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold">{stats.totalUsers}</p>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader>
      <CardTitle>Total Diagnosticări</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold">{stats.totalDiagnostics}</p>
    </CardContent>
  </Card>
  
  {/* More cards... */}
</div>
\`\`\`

---

## 10. Secțiune Utilizator

### 10.1 Funcționalitatea Principală - Diagnosticare AI

**Flux:**

1. Utilizator introduce simptomele auto
2. Sistem verifică permisiuni (tier, limite)
3. Generare prompt bazat pe tier
4. Apel AI (Groq) pentru diagnostic
5. Salvare în database
6. Actualizare contor folosire
7. Afișare rezultat

**Controller:**

\`\`\`typescript
// app/actions/diagnostic-actions.ts
export async function generateDiagnosis(data: {
  symptoms: string
  vehicleMake?: string
  vehicleModel?: string
  vehicleYear?: number
}) {
  const user = await getCurrentUser()
  
  // Business logic prin DiagnosticService
  const result = await diagnosticService.performDiagnostic(
    user.id,
    { make: data.vehicleMake, model: data.vehicleModel, year: data.vehicleYear },
    data.symptoms
  )
  
  if ('error' in result) {
    return { error: result.error }
  }
  
  return { success: true, diagnostic: result }
}
\`\`\`

**Service Logic:**

\`\`\`typescript
// lib/services/diagnostic.service.ts
async performDiagnostic(userId, vehicleInfo, symptoms) {
  // 1. Check permissions
  const check = await this.canUserDiagnose(userId)
  if (!check.can) return { error: check.reason }
  
  // 2. Get tier
  const subscription = await subscriptionModel.findByUser(userId)
  const tier = subscription?.tier || 'free'
  
  // 3. Build tier-specific prompt
  const prompt = this.buildPromptForTier(tier, vehicleInfo, symptoms)
  
  // 4. Call AI
  const { object } = await generateObject({
    model: groq("meta-llama/llama-4-maverick-17b-128e-instruct"),
    schema: diagnosticSchema,
    prompt
  })
  
  // 5. Save to database
  const saved = await diagnosticModel.create({
    user_id: userId,
    vehicle_info: vehicleInfo,
    symptoms,
    diagnosis: object.diagnosis,
    severity: object.severity,
    estimated_cost: object.estimated_cost,
    repair_steps: object.repair_steps
  })
  
  // 6. Increment usage
  await subscriptionModel.incrementUsage(userId)
  
  // 7. Invalidate cache
  cacheService.delete(`user:${userId}:stats`)
  
  return saved
}
\`\`\`

### 10.2 Planuri Abonament

**Comparație:**

| Feature | Free Trial | Standard | Premium |
|---------|-----------|----------|---------|
| **Diagnosticări** | 15 total | Nelimitate | Nelimitate |
| **Calitate AI** | Bază | Standard | Avansată |
| **Istoric** | Ultimele 5 | Ultimele 10 | Nelimitat |
| **Rapoarte** | Text simplu | Text detaliat | PDF + Video |
| **Cost** | Gratuit | $9.99/lună | $19.99/lună |
| **Suport** | Email | Email | Live Chat |

**Pagina Pricing:**

\`\`\`tsx
// app/pricing/page.tsx
<div className="grid gap-6 lg:grid-cols-3">
  <PricingCard
    title="Free Trial"
    price="$0"
    features={[
      "15 diagnosticări gratuite",
      "Analiză AI de bază",
      "Ultimele 5 în istoric"
    ]}
  />
  
  <PricingCard
    title="Standard"
    price="$9.99"
    features={[
      "Diagnosticări nelimitate",
      "Analiză AI standard",
      "Ultimele 10 în istoric"
    ]}
    highlighted
  />
  
  <PricingCard
    title="Premium"
    price="$19.99"
    features={[
      "Diagnosticări nelimitate",
      "Analiză AI avansată",
      "Istoric complet"
    ]}
  />
</div>
\`\`\`

### 10.3 Gestionare Abonament

**Dashboard User:**

\`\`\`tsx
// app/dashboard/page.tsx
<Card>
  <CardHeader>
    <CardTitle>Abonamentul Meu</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <label className="text-sm text-muted-foreground">Plan Curent</label>
        <div className="flex items-center gap-2">
          <Badge variant="default">{subscription.tier}</Badge>
        </div>
      </div>
      
      {subscription.tier === 'free' && (
        <div>
          <label className="text-sm text-muted-foreground">
            Diagnosticări Rămase
          </label>
          <Progress 
            value={(subscription.free_diagnostics_used / 15) * 100} 
          />
          <p className="text-sm mt-1">
            {15 - subscription.free_diagnostics_used} din 15
          </p>
        </div>
      )}
      
      <Button asChild>
        <Link href="/pricing">Upgrade Plan</Link>
      </Button>
    </div>
  </CardContent>
</Card>
\`\`\`

---

## 11. Integrări

### 11.1 Supabase

**Autentificare:**

\`\`\`typescript
// lib/supabase/server.ts
export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        }
      }
    }
  )
}
\`\`\`

**Row Level Security:**

\`\`\`sql
-- Users can only see their own data
CREATE POLICY "users_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can see all data
CREATE POLICY "admins_select_all"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
\`\`\`

### 11.2 Stripe

**Checkout Session:**

\`\`\`typescript
// app/actions/stripe-actions.ts
export async function createCheckoutSession(tier: 'standard' | 'premium') {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const user = await getCurrentUser()
  
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    mode: 'subscription',
    line_items: [{
      price: tier === 'standard' ? STANDARD_PRICE_ID : PREMIUM_PRICE_ID,
      quantity: 1
    }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`
  })
  
  return { sessionId: session.id, url: session.url }
}
\`\`\`

**Webhook Handler:**

\`\`\`typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!
  const body = await req.text()
  
  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    
    // Update subscription in database
    await updateSubscription(session.customer, {
      tier: getTierFromPriceId(session.line_items[0].price.id),
      is_active: true,
      stripe_subscription_id: session.subscription
    })
  }
  
  return new Response('OK', { status: 200 })
}
\`\`\`

### 11.3 Groq AI

**Configurare:**

\`\`\`typescript
// lib/services/diagnostic.service.ts
const groq = createGroq({
  apiKey: process.env.API_KEY_GROQ_API_KEY
})

const model = groq("meta-llama/llama-4-maverick-17b-128e-instruct")
\`\`\`

**Structured Output:**

\`\`\`typescript
const { object } = await generateObject({
  model,
  schema: z.object({
    diagnosis: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    estimated_cost: z.string(),
    repair_steps: z.array(z.string()),
    recommendations: z.string()
  }),
  prompt: `Analyze these car symptoms: ${symptoms}`
})
\`\`\`

---

## 12. Instalare și Configurare

### 12.1 Prerequisite

- Node.js 18+
- pnpm (sau npm)
- Cont Supabase
- Cont Stripe
- Cont Groq

### 12.2 Instalare

\`\`\`bash
# Clone repository
git clone [repository-url]
cd aplicatie-diagnosticare-auto

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
\`\`\`

### 12.3 Variabile Mediu

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Groq AI
API_KEY_GROQ_API_KEY=[groq-api-key]

# Stripe
STRIPE_SECRET_KEY=[stripe-secret-key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[stripe-publishable-key]
STRIPE_WEBHOOK_SECRET=[webhook-secret]

# App
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
\`\`\`

### 12.4 Configurare Database

\`\`\`bash
# Rulează scripturile SQL în ordine:
# 1. scripts/001_create_users_and_profiles.sql
# 2. scripts/002_create_subscriptions.sql
# 3. scripts/003_create_diagnostics.sql
# 4. scripts/007_fix_diagnostics_foreign_key.sql
# 5. scripts/008_fix_subscriptions_foreign_key.sql
# 6. scripts/009_add_soft_delete_columns.sql
\`\`\`

### 12.5 Rulare Aplicație

\`\`\`bash
# Development
pnpm dev

# Build
pnpm build

# Production
pnpm start
\`\`\`

Aplicația va rula pe `http://localhost:3000`

### 12.6 Creare Cont Admin

\`\`\`sql
-- Rulează în Supabase SQL Editor
UPDATE profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
\`\`\`

---

## Concluzii

Aplicația implementează toate cerințele din grila de evaluare:

✅ **Secțiune Admin** - CRUD complet pe 2 entități (Users + Diagnostics) cu chei străine  
✅ **Secțiune Utilizator** - Planuri abonament și funcționalitate diagnosticare AI  
✅ **ORM** - BaseModel + modele specifice pentru abstractizare database  
✅ **Services Layer** - Logică business în UserService și DiagnosticService  
✅ **Logică Business** - Validări, tier-based AI prompts, permission checks  
✅ **Complexitate** - Cache, logging, dependency injection, soft delete  
✅ **Documentație** - Document complet cu arhitectură și implementare

**Arhitectura MVC** este respectată pe deplin cu separare clară între Model (ORM), View (React Components), și Controller (Server Actions), cu adăugarea unui nivel Services pentru logica de business complexă.

---

**Dezvoltat de:** Cristian Cudla  
**Email:** cristian.cudla1@student.usv.ro  
**An:** 2025-2026
