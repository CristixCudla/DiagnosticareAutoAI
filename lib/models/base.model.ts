import { createClient } from "@/lib/supabase/server"

export abstract class BaseModel<T> {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  // ORM Method: Find all records
  async findAll(options?: {
    orderBy?: string
    ascending?: boolean
    limit?: number
  }): Promise<T[]> {
    const supabase = await createClient()
    let query = supabase.from(this.tableName).select("*")

    if (options?.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options.ascending ?? false,
      })
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data as T[]
  }

  // ORM Method: Find by ID
  async findById(id: string): Promise<T | null> {
    const supabase = await createClient()
    const query = supabase.from(this.tableName).select("*").eq("id", id)

    const { data, error } = await query.single()

    if (error) return null
    return data as T
  }

  // ORM Method: Create new record
  async create(data: Partial<T>): Promise<T | null> {
    const supabase = await createClient()
    const { data: created, error } = await supabase
      .from(this.tableName)
      .insert(data as any)
      .select()
      .single()

    if (error) throw error
    return created as T
  }

  // ORM Method: Update record
  async update(id: string, data: Partial<T>): Promise<T | null> {
    const supabase = await createClient()
    const { data: updated, error } = await supabase
      .from(this.tableName)
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return updated as T
  }

  // ORM Method: Soft delete (disabled until SQL script is run)
  async softDelete(id: string): Promise<boolean> {
    return this.hardDelete(id)
  }

  // ORM Method: Hard delete
  async hardDelete(id: string): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase.from(this.tableName).delete().eq("id", id)

    return !error
  }

  // ORM Method: Count records
  async count(): Promise<number> {
    const supabase = await createClient()
    const query = supabase.from(this.tableName).select("*", { count: "exact", head: true })

    const { count, error } = await query

    if (error) throw error
    return count || 0
  }
}
