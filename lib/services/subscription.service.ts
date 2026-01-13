import type { ISubscriptionService } from "../di/interfaces"
import { SubscriptionModel } from "../models/subscription.model"

export class SubscriptionService implements ISubscriptionService {
  private subscriptionModel: SubscriptionModel

  constructor(subscriptionModel: SubscriptionModel = new SubscriptionModel()) {
    this.subscriptionModel = subscriptionModel
  }

  async getUserSubscription(userId: string) {
    console.log("[SubscriptionService] Getting subscription for user:", userId)
    return await this.subscriptionModel.findByUser(userId)
  }

  async updateSubscription(userId: string, tier: string) {
    console.log("[SubscriptionService] Updating subscription:", { userId, tier })
    return await this.subscriptionModel.update(userId, { tier })
  }

  async canUpgrade(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) return false

    return subscription.tier === "free" || subscription.tier === "standard"
  }
}

export const subscriptionService = new SubscriptionService()
