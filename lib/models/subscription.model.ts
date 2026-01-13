import { BaseModel } from "./base.model"

export interface Subscription {
  id: string
  user_id: string
  tier: "free" | "standard" | "premium"
  is_active: boolean
  free_diagnostics_used: number
  free_diagnostics_limit: number
  subscription_start_date: string | null
  subscription_end_date: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export class SubscriptionModel extends BaseModel<Subscription> {
  constructor() {
    super("subscriptions")
  }

  // Custom query: Find by user (foreign key relationship)
  async findByUser(userId: string): Promise<Subscription | null> {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single()

    if (error) return null
    return data as Subscription
  }

  // Business logic: Check if user can diagnose
  async canUserDiagnose(userId: string): Promise<boolean> {
    const subscription = await this.findByUser(userId)

    if (!subscription) return false
    if (!subscription.is_active) return false

    // Premium and Standard always can diagnose
    if (subscription.tier === "premium" || subscription.tier === "standard") {
      return true
    }

    // Free tier check limit
    return subscription.free_diagnostics_used < subscription.free_diagnostics_limit
  }

  // Business logic: Increment usage counter
  async incrementUsage(userId: string): Promise<boolean> {
    const subscription = await this.findByUser(userId)

    if (!subscription) return false

    if (subscription.tier === "free") {
      await this.update(subscription.id, {
        free_diagnostics_used: subscription.free_diagnostics_used + 1,
      })
    }

    return true
  }
}
