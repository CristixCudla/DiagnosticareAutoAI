import { UserModel, type User } from "@/lib/models/user.model"
import { SubscriptionModel } from "@/lib/models/subscription.model"
import { logger } from "./logger.service"
import { cacheService } from "./cache.service"

export class UserService {
  private userModel: UserModel
  private subscriptionModel: SubscriptionModel

  // Dependency Injection via constructor
  constructor(userModel: UserModel = new UserModel(), subscriptionModel: SubscriptionModel = new SubscriptionModel()) {
    this.userModel = userModel
    this.subscriptionModel = subscriptionModel
  }

  // Business Logic: Get all active users with caching
  async getAllActiveUsers(): Promise<User[]> {
    const cacheKey = "users:active:all"
    const cached = cacheService.get<User[]>(cacheKey)

    if (cached) {
      logger.info("Users retrieved from cache", { count: cached.length })
      return cached
    }

    logger.info("Fetching users from database")
    const users = await this.userModel.findAll({
      orderBy: "created_at",
      ascending: false,
    })

    cacheService.set(cacheKey, users, 60) // Cache for 1 minute
    logger.info("Users fetched successfully", { count: users.length })

    return users
  }

  // Business Logic: Get user with full details
  async getUserWithDetails(userId: string) {
    const cacheKey = `user:${userId}:details`
    const cached = cacheService.get(cacheKey)

    if (cached) {
      logger.info("User details retrieved from cache", { userId })
      return cached
    }

    logger.info("Fetching user details", { userId })

    const user = await this.userModel.findWithSubscriptions(userId)

    if (!user) {
      logger.warn("User not found", { userId })
      return null
    }

    cacheService.set(cacheKey, user, 30) // Cache for 30 seconds
    logger.info("User details fetched successfully", { userId, email: user.email })

    return user
  }

  // Business Logic: Update user with validation
  async updateUser(userId: string, data: Partial<User>): Promise<User | null> {
    try {
      logger.info("Updating user", { userId, fields: Object.keys(data) })

      // Business validation
      if (data.email) {
        const existingUser = await this.userModel.findByEmail(data.email)
        if (existingUser && existingUser.id !== userId) {
          logger.error("Email already in use", { email: data.email })
          throw new Error("Email already in use")
        }
      }

      const updated = await this.userModel.update(userId, data)

      // Invalidate cache
      cacheService.delete(`user:${userId}:details`)
      cacheService.delete("users:active:all")

      logger.info("User updated successfully", { userId })
      return updated
    } catch (error) {
      logger.error("Failed to update user", error, { userId })
      throw error
    }
  }

  // Business Logic: Soft delete user
  async deleteUser(userId: string): Promise<boolean> {
    try {
      logger.info("Soft deleting user", { userId })

      // Check if user has active subscription
      const subscription = await this.subscriptionModel.findByUser(userId)
      if (subscription && subscription.is_active && subscription.tier !== "free") {
        logger.warn("Cannot delete user with active paid subscription", { userId })
        throw new Error("Cannot delete user with active paid subscription")
      }

      const success = await this.userModel.softDelete(userId)

      if (success) {
        // Invalidate cache
        cacheService.delete(`user:${userId}:details`)
        cacheService.delete("users:active:all")

        logger.info("User soft deleted successfully", { userId })
      }

      return success
    } catch (error) {
      logger.error("Failed to delete user", error, { userId })
      throw error
    }
  }

  // Business Logic: Get user statistics
  async getUserStatistics(userId: string) {
    const cacheKey = `user:${userId}:stats`
    const cached = cacheService.get(cacheKey)

    if (cached) return cached

    logger.info("Calculating user statistics", { userId })

    const { DiagnosticModel } = await import("@/lib/models/diagnostic.model")
    const diagnosticModel = new DiagnosticModel()

    const diagnostics = await diagnosticModel.findByUser(userId)
    const subscription = await this.subscriptionModel.findByUser(userId)

    const stats = {
      totalDiagnostics: diagnostics.length,
      tier: subscription?.tier || "free",
      remainingFreeUsage:
        subscription?.tier === "free" ? subscription.free_diagnostics_limit - subscription.free_diagnostics_used : null,
      severityBreakdown: {
        low: diagnostics.filter((d) => d.severity === "low").length,
        medium: diagnostics.filter((d) => d.severity === "medium").length,
        high: diagnostics.filter((d) => d.severity === "high").length,
        critical: diagnostics.filter((d) => d.severity === "critical").length,
      },
    }

    cacheService.set(cacheKey, stats, 120) // Cache for 2 minutes
    logger.info("User statistics calculated", { userId, stats })

    return stats
  }

  // User service for documentation purposes
  // Runtime code uses direct Supabase queries
  async getUsers() {
    return []
  }

  async getUserById(id: string) {
    return null
  }

  async updateUser(id: string, data: any) {
    return { success: true }
  }

  async deleteUser(id: string) {
    return { success: true }
  }
}

// Export singleton instance
export const userService = new UserService()
