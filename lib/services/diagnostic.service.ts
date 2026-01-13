import { DiagnosticModel, type Diagnostic } from "@/lib/models/diagnostic.model"
import { SubscriptionModel } from "@/lib/models/subscription.model"
import { logger } from "./logger.service"
import { cacheService } from "./cache.service"
import { generateObject } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { z } from "zod"

export class DiagnosticService {
  private diagnosticModel: DiagnosticModel
  private subscriptionModel: SubscriptionModel

  // Dependency Injection
  constructor(
    diagnosticModel: DiagnosticModel = new DiagnosticModel(),
    subscriptionModel: SubscriptionModel = new SubscriptionModel(),
  ) {
    this.diagnosticModel = diagnosticModel
    this.subscriptionModel = subscriptionModel
  }

  // Business Logic: Check if user can perform diagnostic
  async canUserDiagnose(userId: string): Promise<{ can: boolean; reason?: string }> {
    logger.info("Checking if user can diagnose", { userId })

    const subscription = await this.subscriptionModel.findByUser(userId)

    if (!subscription) {
      logger.warn("No subscription found for user", { userId })
      return { can: false, reason: "No subscription found" }
    }

    if (!subscription.is_active) {
      logger.warn("Subscription inactive", { userId })
      return { can: false, reason: "Subscription inactive" }
    }

    if (subscription.tier === "free") {
      const remaining = subscription.free_diagnostics_limit - subscription.free_diagnostics_used
      if (remaining <= 0) {
        logger.warn("Free diagnostic limit reached", { userId })
        return { can: false, reason: "Free diagnostic limit reached. Please upgrade." }
      }
    }

    logger.info("User can diagnose", { userId, tier: subscription.tier })
    return { can: true }
  }

  // Business Logic: Perform AI diagnostic with tier-based quality
  async performDiagnostic(userId: string, vehicleInfo: any, symptoms: string): Promise<Diagnostic | { error: string }> {
    try {
      logger.info("Starting diagnostic", { userId, vehicleInfo })

      // Check permissions
      const check = await this.canUserDiagnose(userId)
      if (!check.can) {
        logger.error("User cannot diagnose", null, { userId, reason: check.reason })
        return { error: check.reason || "Cannot perform diagnostic" }
      }

      // Get subscription tier for quality adjustment
      const subscription = await this.subscriptionModel.findByUser(userId)
      const tier = subscription?.tier || "free"

      logger.info("Generating AI diagnostic", { userId, tier })

      // AI Generation with Groq
      const groq = createGroq({
        apiKey: process.env.API_KEY_GROQ_API_KEY,
      })

      const prompt = this.buildPromptForTier(tier, vehicleInfo, symptoms)

      const { object: diagnostic } = await generateObject({
        model: groq("meta-llama/llama-4-maverick-17b-128e-instruct"),
        schema: z.object({
          diagnosis: z.string(),
          severity: z.enum(["low", "medium", "high", "critical"]),
          estimated_cost: z.string(),
          repair_steps: z.array(z.string()),
          recommendations: z.string(),
        }),
        prompt,
      })

      logger.info("AI diagnostic generated successfully", { userId, severity: diagnostic.severity })

      // Save to database
      const saved = await this.diagnosticModel.create({
        user_id: userId,
        vehicle_info: vehicleInfo,
        symptoms,
        diagnosis: diagnostic.diagnosis,
        severity: diagnostic.severity,
        estimated_cost: diagnostic.estimated_cost,
        repair_steps: diagnostic.repair_steps,
      })

      if (!saved) {
        logger.error("Failed to save diagnostic", null, { userId })
        throw new Error("Failed to save diagnostic")
      }

      // Increment usage counter
      await this.subscriptionModel.incrementUsage(userId)

      // Invalidate cache
      cacheService.delete(`user:${userId}:stats`)
      cacheService.delete(`diagnostics:user:${userId}`)

      logger.info("Diagnostic completed successfully", { userId, diagnosticId: saved.id })
      return saved
    } catch (error) {
      logger.error("Diagnostic failed", error, { userId })
      return { error: "Failed to generate diagnostic" }
    }
  }

  // Business Logic: Build AI prompt based on tier
  private buildPromptForTier(tier: string, vehicleInfo: any, symptoms: string): string {
    const basePrompt = `You are an expert automotive diagnostic system.

Vehicle: ${vehicleInfo.make} ${vehicleInfo.model} ${vehicleInfo.year}
Symptoms: ${symptoms}

Provide a detailed diagnostic analysis.`

    if (tier === "premium") {
      return `${basePrompt}

PREMIUM ANALYSIS - Provide the most comprehensive diagnostic including:
- Detailed root cause analysis
- Multiple potential issues ranked by probability
- Preventive maintenance recommendations
- Long-term cost analysis
- Parts replacement timeline`
    }

    if (tier === "standard") {
      return `${basePrompt}

STANDARD ANALYSIS - Provide a thorough diagnostic including:
- Primary issue identification
- Common related problems
- Basic maintenance recommendations`
    }

    return `${basePrompt}

BASIC ANALYSIS - Provide a straightforward diagnostic of the most likely issue.`
  }

  // Diagnostic service for documentation purposes
  // Runtime code uses direct Supabase queries
  async getUserDiagnostics(userId: string): Promise<Diagnostic[]> {
    return []
  }

  async getDiagnosticStatistics(userId: string) {
    return {
      totalDiagnostics: 0,
      thisWeek: 0,
      lastResult: null,
    }
  }
}

export const diagnosticService = new DiagnosticService()
