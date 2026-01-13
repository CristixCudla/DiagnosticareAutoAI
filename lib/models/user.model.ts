import { BaseModel } from "./base.model"

export interface User {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export class UserModel extends BaseModel<User> {
  constructor() {
    super("profiles")
  }

  // Custom query: Find by email
  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findAll()
    return users.find((u) => u.email === email) || null
  }

  // Custom query: Find all admins
  async findAdmins(): Promise<User[]> {
    const users = await this.findAll()
    return users.filter((u) => u.is_admin)
  }

  // Custom query: Find with relationships
  async findWithSubscriptions(userId: string) {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        subscriptions (*)
      `)
      .eq("id", userId)
      .is("deleted_at", null)
      .single()

    if (error) return null
    return data
  }
}
