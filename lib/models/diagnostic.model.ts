import { BaseModel } from "./base.model"

export interface Diagnostic {
  id: string
  user_id: string
  vehicle_info: any
  symptoms: string
  diagnosis: string
  severity: string
  estimated_cost: string
  repair_steps: string[]
  created_at: string
  updated_at: string
}

export class DiagnosticModel extends BaseModel<Diagnostic> {
  constructor() {
    super("diagnostics")
  }

  // Custom query: Find by user (foreign key relationship)
  async findByUser(userId: string): Promise<Diagnostic[]> {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("diagnostics")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Diagnostic[]
  }

  // Custom query: Find with user info (JOIN)
  async findWithUser(diagnosticId: string) {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("diagnostics")
      .select(`
        *,
        profiles (
          id,
          email,
          full_name
        )
      `)
      .eq("id", diagnosticId)
      .single()

    if (error) return null
    return data
  }

  // Business logic: Count diagnostics by severity
  async countBySeverity(): Promise<Record<string, number>> {
    const diagnostics = await this.findAll()
    const counts: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    }

    diagnostics.forEach((d) => {
      if (d.severity in counts) {
        counts[d.severity]++
      }
    })

    return counts
  }
}
