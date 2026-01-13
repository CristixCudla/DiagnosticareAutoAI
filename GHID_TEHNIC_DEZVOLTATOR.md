# Ghid Tehnic Dezvoltator - AutoCare AI
**Explicații Detaliate: Frontend, Backend, Supabase, AI Integration**

---

## 📋 CUPRINS

1. [Frontend Architecture](#1-frontend-architecture)
2. [Backend Architecture](#2-backend-architecture)
3. [Supabase Integration](#3-supabase-integration)
4. [AI Integration (Groq LLaMA)](#4-ai-integration-groq-llama)
5. [State Management](#5-state-management)
6. [Authentication Flow](#6-authentication-flow)
7. [Database Schema](#7-database-schema)
8. [API Design](#8-api-design)
9. [Caching Strategy](#9-caching-strategy)
10. [Deployment](#10-deployment)

---

## 1. FRONTEND ARCHITECTURE

### 1.1 Technology Stack

```json
{
  "framework": "Next.js 16.0.0",
  "runtime": "React 19.2 (with Activity API)",
  "language": "TypeScript 5.6",
  "styling": "Tailwind CSS 4.0",
  "ui-components": "shadcn/ui (customizat)",
  "routing": "Next.js App Router (file-based)"
}
```

### 1.2 Project Structure

```
app/
├── page.tsx                    # Homepage (/)
├── dashboard/page.tsx          # User Dashboard (/dashboard)
├── admin/                      # Admin Panel
│   ├── page.tsx               # Admin Dashboard (/admin)
│   ├── users/
│   │   ├── page.tsx           # User List (/admin/users)
│   │   └── [id]/page.tsx      # User Details (/admin/users/123)
│   ├── subscriptions/page.tsx # Subscription Management
│   └── diagnostics/page.tsx   # Diagnostics Management
├── auth/                       # Authentication Pages
│   ├── login/page.tsx
│   ├── sign-up/page.tsx
│   └── reset-password/page.tsx
├── pricing/page.tsx            # Pricing Plans
├── settings/page.tsx           # User Settings
├── actions/                    # Server Actions (API)
│   ├── auth-actions.ts
│   ├── admin-crud-actions.ts
│   └── diag.ts
├── layout.tsx                  # Root Layout
└── globals.css                 # Global Styles

components/
├── new-diagnostic-form.tsx     # Diagnostic Generation Form
├── diagnostic-history.tsx      # Diagnostic History Table
├── subscription-status.tsx     # Subscription Card
├── admin/                      # Admin Components
│   ├── user-management-table.tsx
│   ├── subscription-management-table.tsx
│   └── diagnostics-management-table.tsx
└── ui/                         # Reusable UI Components
    ├── button.tsx
    ├── card.tsx
    └── ...
```

### 1.3 Rendering Strategies

**Server Components (Default în Next.js 16)**
```tsx
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch data direct pe server
  const diagnostics = await getDiagnostics(user.id)
  
  return (
    <div>
      <h1>Welcome {user.email}</h1>
      <DiagnosticHistory diagnostics={diagnostics} />
    </div>
  )
}
```

**Client Components (pentru interactivitate)**
```tsx
// components/new-diagnostic-form.tsx
"use client" // Marcator pentru Client Component

import { useState } from "react"
import { generateDiagnostic } from "@/app/actions/diag"

export function NewDiagnosticForm() {
  const [loading, setLoading] = useState(false)
  
  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await generateDiagnostic(formData)
    setLoading(false)
    // Update UI
  }
  
  return <form action={handleSubmit}>...</form>
}
```

**Când folosim fiecare:**
- **Server Component:** Fetch data, SEO, no JavaScript needed
- **Client Component:** State management, event handlers, hooks (useState, useEffect)

### 1.4 Styling Strategy

**Tailwind CSS 4.0 cu Design System**

```css
/* app/globals.css */
@import "tailwindcss";

@theme inline {
  /* Design Tokens */
  --color-primary: #ef4444;      /* Red */
  --color-secondary: #ffffff;    /* White */
  --color-background: #0a0a0a;   /* Near black */
  --color-foreground: #fafafa;   /* Off white */
  
  /* Font Families */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

**Component Styling Pattern:**
```tsx
// Consistent dark theme cu red accents
<div className="min-h-screen bg-gray-950 text-white">
  <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
    Diagnosticare Auto AI
  </h1>
  
  <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
    Generează Diagnostic
  </button>
</div>
```

**Responsive Design:**
```tsx
<div className="
  grid 
  grid-cols-1          /* Mobile: 1 column */
  md:grid-cols-2       /* Tablet: 2 columns */
  lg:grid-cols-3       /* Desktop: 3 columns */
  gap-6
">
  {/* Cards */}
</div>
```

### 1.5 Form Handling

**Server Actions (no API routes needed)**

```tsx
// components/new-diagnostic-form.tsx
export function NewDiagnosticForm() {
  return (
    <form action={generateDiagnostic}>  {/* Direct server action */}
      <input name="carModel" required />
      <input name="year" type="number" required />
      <textarea name="symptom" required />
      <button type="submit">Generează</button>
    </form>
  )
}

// app/actions/diag.ts (Server-side)
"use server"

export async function generateDiagnostic(formData: FormData) {
  const carModel = formData.get("carModel") as string
  const year = formData.get("year") as string
  const symptom = formData.get("symptom") as string
  
  // Business logic pe server
  const result = await callGroqAPI(carModel, year, symptom)
  
  // Save to DB
  await saveDiagnosticToDB(result)
  
  return result
}
```

**Beneficii:**
- Type-safe: TypeScript verifică tipurile
- Secure: logica rulează pe server, nu în browser
- Simple: no fetch(), no API routes, no CORS issues

---

## 2. BACKEND ARCHITECTURE

### 2.1 Technology Stack

```json
{
  "runtime": "Node.js 20.9+",
  "framework": "Next.js Server Actions",
  "database": "PostgreSQL (via Supabase)",
  "orm": "Custom BaseModel ORM",
  "auth": "Supabase Auth (JWT)",
  "ai": "Groq API (LLaMA 3.1 70B)",
  "payments": "Stripe (sandbox)"
}
```

### 2.2 Layers Architecture

```
┌─────────────────────────────────────────────────────────┐
│ CONTROLLER LAYER (Server Actions)                       │
│ → app/actions/*.ts                                      │
│ → Handle HTTP requests                                  │
│ → Validate input                                        │
│ → Call Services                                         │
│ → Return responses                                      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ BUSINESS LAYER (Services)                               │
│ → lib/services/*.service.ts                            │
│ → Business logic                                        │
│ → Validare complexă                                     │
│ → Orchestration (coordonare multiple models)            │
│ → Caching, Logging                                      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ ORM LAYER (Models)                                      │
│ → lib/models/*.model.ts                                │
│ → CRUD operations                                       │
│ → Query building                                        │
│ → Data mapping                                          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ DATA LAYER (Supabase PostgreSQL)                        │
│ → Tables: users, subscriptions, diagnostics             │
│ → Foreign Keys: user_id → users.id                      │
│ → Indexes pentru performanță                            │
└─────────────────────────────────────────────────────────┘
```

### 2.3 ORM Implementation

**BaseModel Abstract Class:**

```typescript
// lib/models/base.model.ts
export abstract class BaseModel<T> {
  protected tableName: string
  
  constructor(tableName: string) {
    this.tableName = tableName
  }
  
  // Generic CRUD methods
  async findAll(options?: FindOptions): Promise<T[]> {
    const supabase = await createClient()
    let query = supabase.from(this.tableName).select("*")
    
    if (options?.orderBy) {
      query = query.order(options.orderBy, { 
        ascending: options.ascending ?? false 
      })
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    const { data, error } = await query
    if (error) throw error
    
    return data as T[]
  }
  
  async findById(id: string): Promise<T | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single()
    
    if (error) return null
    return data as T
  }
  
  async create(data: Partial<T>): Promise<T> {
    const supabase = await createClient()
    const { data: created, error } = await supabase
      .from(this.tableName)
      .insert(data as any)
      .select()
      .single()
    
    if (error) throw error
    return created as T
  }
  
  async update(id: string, data: Partial<T>): Promise<T> {
    const supabase = await createClient()
    const { data: updated, error } = await supabase
      .from(this.tableName)
      .update({
        ...data,
        updated_at: new Date().toISOString()
      } as any)
      .eq("id", id)
      .select()
      .single()
    
    if (error) throw error
    return updated as T
  }
  
  // Soft Delete (Lab 9)
  async softDelete(id: string): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from(this.tableName)
      .update({ 
        deleted_at: new Date().toISOString() 
      } as any)
      .eq("id", id)
    
    return !error
  }
  
  // Hard Delete
  async hardDelete(id: string): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq("id", id)
    
    return !error
  }
}
```

**Extending BaseModel:**

```typescript
// lib/models/user.model.ts
export interface User {
  id: string
  email: string
  role: "user" | "admin"
  created_at: string
  updated_at: string
  deleted_at?: string
}

export class UserModel extends BaseModel<User> {
  constructor() {
    super("users")  // Table name
  }
  
  // Custom method
  async findByEmail(email: string): Promise<User | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("email", email)
      .single()
    
    if (error) return null
    return data as User
  }
  
  // Complex query cu JOIN
  async findWithSubscriptions(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        subscriptions (
          id,
          tier,
          is_active,
          expires_at
        )
      `)
      .eq("id", userId)
      .single()
    
    if (error) return null
    return data
  }
}
```

### 2.4 Services Layer

**UserService Business Logic:**

```typescript
// lib/services/user.service.ts
export class UserService {
  private userModel: UserModel
  private subscriptionModel: SubscriptionModel
  
  constructor(
    userModel: UserModel = new UserModel(),
    subscriptionModel: SubscriptionModel = new SubscriptionModel()
  ) {
    this.userModel = userModel
    this.subscriptionModel = subscriptionModel
  }
  
  // Business Logic: Get active users cu cache
  async getAllActiveUsers(): Promise<User[]> {
    const cacheKey = "users:active:all"
    
    // Check cache
    const cached = cacheService.get<User[]>(cacheKey)
    if (cached) {
      console.log("[UserService] Cache HIT:", cacheKey)
      return cached
    }
    
    console.log("[UserService] Cache MISS:", cacheKey)
    
    // Fetch from DB
    const users = await this.userModel.findAll({
      orderBy: "created_at",
      ascending: false
    })
    
    // Filter deleted
    const active = users.filter(u => !u.deleted_at)
    
    // Cache result
    cacheService.set(cacheKey, active, 60) // 60s TTL
    
    return active
  }
  
  // Business Logic: Update cu validare
  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    // Validare business: email unic
    if (data.email) {
      const existing = await this.userModel.findByEmail(data.email)
      if (existing && existing.id !== userId) {
        throw new Error("Email deja folosit de alt utilizator")
      }
    }
    
    // Update
    const updated = await this.userModel.update(userId, data)
    
    // Invalidate cache
    cacheService.delete(`user:${userId}:details`)
    cacheService.delete("users:active:all")
    
    console.log("[UserService] User updated:", userId)
    
    return updated
  }
  
  // Business Logic: Soft delete cu verificare abonament
  async deleteUser(userId: string): Promise<boolean> {
    // Check: nu poți șterge user cu abonament Premium activ
    const subscription = await this.subscriptionModel.findByUser(userId)
    
    if (subscription?.tier === "premium" && subscription.is_active) {
      throw new Error(
        "Nu poți șterge utilizator cu abonament Premium activ. " +
        "Anulează mai întâi abonamentul."
      )
    }
    
    // Soft delete
    const success = await this.userModel.softDelete(userId)
    
    if (success) {
      // Invalidate cache
      cacheService.removeByPattern(`user:${userId}`)
      console.log("[UserService] User soft deleted:", userId)
    }
    
    return success
  }
}
```

**De ce Services Layer?**
- **Separation of Concerns:** Business logic separată de DB operations
- **Reusability:** Logica poate fi folosită în multiple controllers
- **Testability:** Poți mocka Models și testa doar business logic
- **Maintainability:** Schimbări business nu afectează DB layer

---

## 3. SUPABASE INTEGRATION

### 3.1 Supabase Overview

**Ce este Supabase?**
- PostgreSQL managed database (open-source)
- Built-in Authentication (JWT)
- Row Level Security (RLS) pentru securitate
- Real-time subscriptions (WebSocket)
- Storage pentru fișiere

**De ce Supabase?**
- Setup rapid (fără configurare PostgreSQL manual)
- Auth out-of-the-box (email, OAuth, magic links)
- Securitate: RLS garantează că fiecare user vede doar datele sale
- Scalabil: managed by Supabase (backups, updates)

### 3.2 Client Setup

**Server-Side Client (pentru Server Components):**

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

**Client-Side Client (pentru Client Components):**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Usage:**

```tsx
// Server Component
import { createClient } from "@/lib/supabase/server"

export default async function Page() {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  return <div>Welcome {user?.email}</div>
}

// Client Component
"use client"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const supabase = createClient()
  
  async function handleLogin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
  }
}
```

### 3.3 Authentication Flow

**Sign Up:**

```typescript
// app/actions/auth-actions.ts
"use server"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
    }
  })
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  // Create user record in users table
  await supabase.from("users").insert({
    id: data.user!.id,
    email: data.user!.email,
    role: "user"
  })
  
  // Create free subscription
  await supabase.from("subscriptions").insert({
    user_id: data.user!.id,
    tier: "free",
    is_active: true
  })
  
  return { success: true }
}
```

**Sign In:**

```typescript
export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    return { success: false, error: "Email sau parolă incorectă" }
  }
  
  redirect("/dashboard")
}
```

**Middleware (Session Refresh):**

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function middleware(request) {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
  
  // Refresh session
  await supabase.auth.getUser()
  
  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
```

### 3.4 Row Level Security (RLS)

**Concept:** Fiecare query SQL verifică automat permisiunile user-ului

**Exemplu RLS Policy pentru `diagnostics`:**

```sql
-- Users pot vedea doar propriile diagnostice
CREATE POLICY "Users can view own diagnostics"
ON diagnostics FOR SELECT
USING (auth.uid() = user_id);

-- Users pot crea propriile diagnostice
CREATE POLICY "Users can create own diagnostics"
ON diagnostics FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins pot vedea toate diagnosticele
CREATE POLICY "Admins can view all diagnostics"
ON diagnostics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**Beneficii RLS:**
- Securitate la nivel de DB, nu la nivel de aplicație
- Imposibil de bypass (chiar dacă aplicația are bug)
- Queries simple: `SELECT * FROM diagnostics` returnează automat doar datele permise

---

## 4. AI INTEGRATION (GROQ LLAMA)

### 4.1 Groq API Overview

**Ce este Groq?**
- Platforma AI cu hardware accelerat (LPU - Language Processing Unit)
- Modele open-source: LLaMA 3.1, Mixtral, Gemma
- Performanță extremă: 200+ tokens/sec (vs OpenAI: 40 tokens/sec)
- Cost redus: $0.59/1M tokens (vs GPT-4: $30/1M tokens)

**De ce LLaMA 3.1 70B?**
- 70 miliarde parametri → calitate răspunsuri
- Context window: 131K tokens → poate procesa manuale tehnice întregi
- Open-source: transparency, no vendor lock-in
- JSON mode: returnează JSON structurat consistent

### 4.2 Implementation

**Diagnostic Generation cu Groq:**

```typescript
// app/actions/diag.ts
"use server"

export async function generateDiagnostic(formData: FormData) {
  const carModel = formData.get("carModel") as string
  const year = formData.get("year") as string
  const symptom = formData.get("symptom") as string
  const subscription_tier = formData.get("subscription_tier") as string
  
  // Call Groq API
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.API_KEY_GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Ești un mecanic auto expert cu 20 ani experiență.
          
          IMPORTANT: Răspunde EXCLUSIV în limba română.
          
          Returnează un obiect JSON cu următoarea structură EXACTĂ:
          {
            "diagnostic": "Descriere detaliată problemă în română",
            "severitate": "low" | "medium" | "high" | "critical",
            "cauze_posibile": ["Cauză 1", "Cauză 2", "Cauză 3"],
            "recomandari": ["Recomandare 1", "Recomandare 2"],
            "piese_afectate": ["Piesă 1", "Piesă 2"],
            "cost_estimat_ron": 500,
            "masuri_preventive": ["Măsură 1", "Măsură 2"]
          }
          
          Costul TREBUIE să fie în RON (lei), nu în EUR sau USD.`
        },
        {
          role: "user",
          content: `Diagnostichează următoarea problemă pentru un ${carModel} din ${year}:
          
          Simptome: ${symptom}
          
          Returnează DOAR JSON-ul, fără text suplimentar.`
        }
      ],
      temperature: 0.3,  // Low pentru consistență
      max_tokens: 2000,
      response_format: { type: "json_object" }  // Force JSON output
    })
  })
  
  const aiResult = await response.json()
  const aiContent = aiResult.choices[0].message.content
  
  // Parse JSON
  let parsedDiagnosis
  try {
    parsedDiagnosis = JSON.parse(aiContent)
  } catch (error) {
    // Fallback: extract JSON from text
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      parsedDiagnosis = JSON.parse(jsonMatch[0])
    } else {
      throw new Error("AI nu a returnat JSON valid")
    }
  }
  
  // Calculate price based on subscription
  const baseCost = parsedDiagnosis.cost_estimat_ron || 500
  const finalCost = subscription_tier === "premium" 
    ? Math.round(baseCost * 0.8)  // 20% discount
    : baseCost
  
  // Save to database
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: diagnostic, error } = await supabase
    .from("diagnostics")
    .insert({
      user_id: user!.id,
      car_model: carModel,
      car_year: parseInt(year),
      symptom: symptom,
      ai_diagnosis: parsedDiagnosis.diagnostic,
      severity: parsedDiagnosis.severitate,
      estimated_cost: finalCost,
      recommendations: JSON.stringify(parsedDiagnosis.recomandari)
    })
    .select()
    .single()
  
  if (error) {
    console.error("[Diagnostics] DB Error:", error)
    throw new Error("Eroare la salvare diagnostic")
  }
  
  return {
    ...parsedDiagnosis,
    cost_estimat_ron: finalCost,
    id: diagnostic.id
  }
}
```

**Key Points:**
- **System Prompt:** Instrucțiuni detaliate pentru AI (format, limbă, structură)
- **Temperature 0.3:** Low pentru output consistent (nu creativitate)
- **JSON Mode:** Force AI să returneze JSON valid
- **Error Handling:** Fallback cu regex dacă JSON parsing fail
- **Business Logic:** Calculare preț cu discount pentru Premium

### 4.3 Prompt Engineering

**Bad Prompt:**
```
"Diagnosticare mașină cu simptome X"
```

**Good Prompt:**
```
Ești un mecanic auto expert cu 20 ani experiență.

CONTEXT:
- Mașină: BMW X5, an 2020
- Simptome: Motorul nu pornește, bateria nouă

TASK:
Diagnostichează problema și returnează JSON cu:
1. Diagnostic complet în română
2. Severitate (low/medium/high/critical)
3. Cauze posibile (array)
4. Recomandări reparații (array)
5. Piese afectate (array)
6. Cost estimat în RON
7. Măsuri preventive (array)

FORMAT: JSON valid, fără text suplimentar.
LIMBĂ: Exclusiv română.
COST: În lei românești (RON), nu EUR/USD.
```

**Why Good Prompt Works:**
- Specific role (mecanic expert)
- Clear context (car model, symptoms)
- Structured output (JSON schema)
- Constraints (language, currency)
- Examples prevent hallucinations

---

## 5. STATE MANAGEMENT

### 5.1 Server State (Supabase Queries)

**Pattern:** Fetch data pe server, pass ca props

```tsx
// Server Component (app/dashboard/page.tsx)
export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch diagnostics
  const { data: diagnostics } = await supabase
    .from("diagnostics")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
  
  return (
    <div>
      <DiagnosticHistory diagnostics={diagnostics} />
    </div>
  )
}
```

### 5.2 Client State (React Hooks)

**useState pentru local UI state:**

```tsx
"use client"

export function NewDiagnosticForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  
  async function handleSubmit(e) {
    setLoading(true)
    const formData = new FormData(e.target)
    const result = await generateDiagnostic(formData)
    setResult(result)
    setLoading(false)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {loading && <Spinner />}
      {result && <DiagnosticResult data={result} />}
    </form>
  )
}
```

### 5.3 Form State (Server Actions)

**useFormState pentru server validation:**

```tsx
"use client"

import { useFormState } from "react"
import { updateUser } from "@/app/actions/admin-crud-actions"

export function UserEditForm({ user }) {
  const [state, formAction] = useFormState(updateUser, null)
  
  return (
    <form action={formAction}>
      <input name="email" defaultValue={user.email} />
      {state?.error && <p className="text-red-500">{state.error}</p>}
      {state?.success && <p className="text-green-500">Salvat!</p>}
      <button type="submit">Salvează</button>
    </form>
  )
}
```

---

## 6. AUTHENTICATION FLOW

### 6.1 Complete Auth Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ 1. User Accesses /auth/login                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Completează form (email, password)                   │
│    Click "Conectare"                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Form submission → Server Action (signIn)             │
│    app/actions/auth-actions.ts                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Supabase Auth Verification                           │
│    supabase.auth.signInWithPassword()                   │
│    → Verifies credentials                               │
│    → Generates JWT token                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. JWT token stored in HTTP-only cookie                 │
│    Name: sb-<project-ref>-auth-token                    │
│    Secure, SameSite=Lax                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Redirect to /dashboard                               │
│    middleware.ts refreshes session on each request      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 7. Dashboard loads                                      │
│    Server Component checks auth:                        │
│    const { data: { user } } = await supabase.auth       │
│                                 .getUser()               │
│    If no user → redirect to /auth/login                 │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Protected Routes

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // No user? Redirect to login
  if (error || !user) {
    redirect("/auth/login")
  }
  
  // User authenticated, proceed
  return <div>Welcome {user.email}</div>
}
```

### 6.3 Admin Protection

```typescript
// app/admin/page.tsx
import { checkIsAdmin } from "@/app/actions/admin-actions"

export default async function AdminPage() {
  const isAdmin = await checkIsAdmin()
  
  if (!isAdmin) {
    redirect("/dashboard")
  }
  
  // Admin authenticated, show admin panel
  return <div>Admin Panel</div>
}

// app/actions/admin-actions.ts
export async function checkIsAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  const { data: dbUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()
  
  return dbUser?.role === "admin"
}
```

---

## 7. DATABASE SCHEMA

### 7.1 Complete ERD (Entity Relationship Diagram)

```
┌──────────────────────────────────────────────────────────┐
│ users                                                     │
├──────────────────────────────────────────────────────────┤
│ id            UUID PRIMARY KEY                           │
│ email         TEXT UNIQUE NOT NULL                       │
│ role          TEXT CHECK(role IN ('user','admin'))       │
│ created_at    TIMESTAMPTZ DEFAULT NOW()                  │
│ updated_at    TIMESTAMPTZ DEFAULT NOW()                  │
│ deleted_at    TIMESTAMPTZ (Soft Delete - Lab 9)          │
└──────────────────────────────────────────────────────────┘
                          ↓ 1
                         (has)
                          ↓ 1
┌──────────────────────────────────────────────────────────┐
│ subscriptions                                             │
├──────────────────────────────────────────────────────────┤
│ id                  UUID PRIMARY KEY                      │
│ user_id             UUID FOREIGN KEY → users.id          │
│ tier                TEXT ('free','standard','premium')   │
│ is_active           BOOLEAN DEFAULT true                 │
│ free_diagnostics_limit   INTEGER DEFAULT 5               │
│ free_diagnostics_used    INTEGER DEFAULT 0               │
│ expires_at          TIMESTAMPTZ                          │
│ created_at          TIMESTAMPTZ DEFAULT NOW()            │
└──────────────────────────────────────────────────────────┘

                          ↑ 1
                        (owns)
                          ↑ N
┌──────────────────────────────────────────────────────────┐
│ diagnostics                                               │
├──────────────────────────────────────────────────────────┤
│ id                  UUID PRIMARY KEY                      │
│ user_id             UUID FOREIGN KEY → users.id          │
│ car_model           TEXT NOT NULL                        │
│ car_year            INTEGER NOT NULL                     │
│ symptom             TEXT NOT NULL                        │
│ ai_diagnosis        TEXT NOT NULL                        │
│ severity            TEXT ('low','medium','high')         │
│ estimated_cost      INTEGER                              │
│ recommendations     JSONB                                │
│ created_at          TIMESTAMPTZ DEFAULT NOW()            │
│ deleted_at          TIMESTAMPTZ (Soft Delete)            │
└──────────────────────────────────────────────────────────┘
```

### 7.2 SQL Schema Scripts

**users + subscriptions:**

```sql
-- scripts/001_create_users_and_profiles.sql

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- Lab 9: Soft Delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- scripts/002_create_subscriptions.sql

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'standard', 'premium')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  free_diagnostics_limit INTEGER DEFAULT 5,
  free_diagnostics_used INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);
```

**diagnostics:**

```sql
-- scripts/003_create_diagnostics.sql

CREATE TABLE diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_model TEXT NOT NULL,
  car_year INTEGER NOT NULL CHECK (car_year >= 1900 AND car_year <= 2100),
  symptom TEXT NOT NULL,
  ai_diagnosis TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  estimated_cost INTEGER,
  recommendations JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- Lab 9: Soft Delete
);

CREATE INDEX idx_diagnostics_user_id ON diagnostics(user_id);
CREATE INDEX idx_diagnostics_severity ON diagnostics(severity);
CREATE INDEX idx_diagnostics_created_at ON diagnostics(created_at DESC);
```

### 7.3 Row Level Security Policies

```sql
-- Enable RLS
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;

-- Users can view own diagnostics
CREATE POLICY "Users can view own diagnostics"
ON diagnostics FOR SELECT
USING (auth.uid() = user_id);

-- Users can create own diagnostics
CREATE POLICY "Users can create own diagnostics"
ON diagnostics FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all diagnostics"
ON diagnostics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

---

## 8. API DESIGN

### 8.1 Server Actions Pattern

**Avantaje față de REST API tradicional:**

| Feature | Server Actions | REST API |
|---------|---------------|----------|
| Type Safety | ✅ Full TypeScript | ❌ Manual typing |
| Auth | ✅ Cookies automatic | ❌ Manual headers |
| CORS | ✅ No issues | ❌ Configuration needed |
| Caching | ✅ React Cache | ❌ Manual |
| Streaming | ✅ Native support | ❌ Complex setup |
| Error Handling | ✅ Type-safe errors | ❌ String errors |

**Exemplu comparație:**

```typescript
// OLD WAY: REST API
// app/api/users/[id]/route.ts
export async function GET(request, { params }) {
  const { id } = params
  const user = await db.users.findById(id)
  return Response.json(user)
}

// Client:
const response = await fetch(`/api/users/${id}`)
const user = await response.json()  // any type!


// NEW WAY: Server Actions
// app/actions/user-actions.ts
"use server"

export async function getUser(id: string): Promise<User> {
  return await db.users.findById(id)
}

// Client:
const user = await getUser(id)  // User type! ✅
```

### 8.2 CRUD Operations

**Standard CRUD pattern pentru orice entitate:**

```typescript
// app/actions/admin-crud-actions.ts
"use server"

import { revalidatePath } from "next/cache"

// CREATE
export async function createUser(formData: FormData) {
  const email = formData.get("email") as string
  const role = formData.get("role") as string
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("users")
    .insert({ email, role })
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath("/admin/users")  // Refresh cache
  return { success: true, user: data }
}

// READ (All)
export async function getAllUsers() {
  const supabase = await createClient()
  
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
  
  if (error) {
    return { users: null, error: error.message }
  }
  
  return { users, error: null }
}

// READ (One)
export async function getUserById(id: string) {
  const supabase = await createClient()
  
  const { data: user, error } = await supabase
    .from("users")
    .select(`
      *,
      subscriptions (*)
    `)
    .eq("id", id)
    .single()
  
  if (error) {
    return { user: null, error: error.message }
  }
  
  return { user, error: null }
}

// UPDATE
export async function updateUser(id: string, formData: FormData) {
  const email = formData.get("email") as string
  const role = formData.get("role") as string
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("users")
    .update({ 
      email, 
      role,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${id}`)
  
  return { success: true, user: data }
}

// DELETE (Soft)
export async function deleteUser(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("users")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath("/admin/users")
  return { success: true }
}
```

---

## 9. CACHING STRATEGY

### 9.1 In-Memory Cache (Lab 12)

**Implementation:**

```typescript
// lib/services/cache.service.ts

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export class MemoryCacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private stats = { hits: 0, misses: 0 }
  
  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    })
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }
    
    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }
    
    this.stats.hits++
    return entry.value as T
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key)
  }
  
  removeByPattern(pattern: string): number {
    let count = 0
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
        count++
      }
    }
    return count
  }
  
  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0 }
  }
  
  getStats() {
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    }
  }
}

export const cacheService = new MemoryCacheService()
```

### 9.2 Cache Invalidation Strategies

**1. Time-based (TTL):**
```typescript
cacheService.set("users:all", users, 60)  // Expire după 60s
```

**2. Event-based (on mutation):**
```typescript
// După UPDATE user
cacheService.removeByPattern(`user:${userId}`)
cacheService.delete("users:all")
```

**3. Pattern-based:**
```typescript
// Invalidate toate cache-urile legate de user
cacheService.removeByPattern(`user:${userId}`)
// Șterge: user:123:details, user:123:stats, user:123:diagnostics
```

### 9.3 Cache Usage în Services

```typescript
// lib/services/user.service.ts

async getAllActiveUsers(): Promise<User[]> {
  const cacheKey = "users:active:all"
  
  // 1. Try cache
  const cached = cacheService.get<User[]>(cacheKey)
  if (cached) {
    console.log("[Cache] HIT:", cacheKey)
    return cached
  }
  
  console.log("[Cache] MISS:", cacheKey)
  
  // 2. Fetch from DB
  const users = await this.userModel.findAll()
  
  // 3. Store in cache
  cacheService.set(cacheKey, users, 60)
  
  return users
}
```

**Performance Impact:**
- DB query: ~50ms
- Cache hit: ~1ms
- **50x faster!** pentru query-uri frecvente

---

## 10. DEPLOYMENT

### 10.1 Vercel Deployment

**Step-by-Step:**

1. **Push to GitHub:**
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

2. **Import în Vercel:**
- Accesați [vercel.com](https://vercel.com)
- Click "New Project" → Import from GitHub
- Selectați repository
- Vercel detectează automat Next.js

3. **Configure Environment Variables:**
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
API_KEY_GROQ_API_KEY=...
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

4. **Deploy:**
- Click "Deploy"
- Durată: ~2-3 minute
- URL: `https://your-app.vercel.app`

### 10.2 Production Checklist

**Pre-Deploy:**
- [ ] Toate environment variables configurate
- [ ] Supabase RLS policies activate
- [ ] Stripe în live mode (nu test)
- [ ] Email templates configurate (Supabase Auth)
- [ ] CORS headers corecte
- [ ] Rate limiting configurat (Supabase)

**Post-Deploy:**
- [ ] Test authentication flow
- [ ] Test AI diagnostic generation
- [ ] Test admin CRUD operations
- [ ] Verify caching functionality
- [ ] Monitor logs (Vercel Analytics)
- [ ] Setup error tracking (Sentry optional)

---

## 📊 REZUMAT STACK COMPLET

### Frontend
- **Framework:** Next.js 16 (React 19.2, TypeScript 5.6)
- **Styling:** Tailwind CSS 4.0
- **State:** React Hooks (useState, useFormState)
- **Forms:** Server Actions (type-safe)

### Backend
- **API:** Next.js Server Actions
- **ORM:** Custom BaseModel (TypeScript)
- **Services:** UserService, DiagnosticService, SubscriptionService
- **DI:** DIContainer (Singleton/Scoped/Transient)
- **Cache:** MemoryCacheService (in-memory, TTL-based)
- **Logging:** Logger class (console + file output)

### Database
- **Provider:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (JWT, email/password)
- **Security:** Row Level Security (RLS)
- **Tables:** users, subscriptions, diagnostics
- **Relations:** Foreign Keys (user_id)

### External Services
- **AI:** Groq API (LLaMA 3.1 70B, 200+ tokens/sec)
- **Payments:** Stripe (sandbox/production)
- **Hosting:** Vercel (Edge Network, auto-scaling)

### Development Tools
- **Version Control:** Git + GitHub
- **Package Manager:** npm
- **Type Checking:** TypeScript
- **Linting:** ESLint
- **Formatting:** Prettier (optional)

---

**Autor:** Echipa AutoCare AI  
**Data:** 15 Ianuarie 2026  
**Versiune:** 1.0.0
