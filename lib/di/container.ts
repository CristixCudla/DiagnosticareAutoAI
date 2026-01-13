/**
 * Service Lifetimes (similar cu Autofac din .NET)
 * - SINGLETON: O singură instanță pentru întreaga aplicație
 * - SCOPED: O instanță per request/context
 * - TRANSIENT: O instanță nouă la fiecare injectare
 */
export enum ServiceLifetime {
  SINGLETON = "singleton",
  SCOPED = "scoped",
  TRANSIENT = "transient",
}

/**
 * Service Registration
 */
interface ServiceRegistration<T = any> {
  factory: () => T
  lifetime: ServiceLifetime
  instance?: T // Pentru SINGLETON
}

/**
 * DI Container (similar cu ContainerBuilder din Autofac)
 */
export class DIContainer {
  private services = new Map<string, ServiceRegistration>()
  private scopedInstances = new Map<string, any>()

  /**
   * Înregistrează un serviciu cu factory și lifetime
   */
  register<T>(token: string, factory: () => T, lifetime: ServiceLifetime = ServiceLifetime.SINGLETON): void {
    console.log(`[DI] Registering service: ${token} with lifetime: ${lifetime}`)

    this.services.set(token, {
      factory,
      lifetime,
      instance: undefined,
    })
  }

  /**
   * Înregistrează un serviciu SINGLETON
   */
  registerSingleton<T>(token: string, factory: () => T): void {
    this.register(token, factory, ServiceLifetime.SINGLETON)
  }

  /**
   * Înregistrează un serviciu SCOPED
   */
  registerScoped<T>(token: string, factory: () => T): void {
    this.register(token, factory, ServiceLifetime.SCOPED)
  }

  /**
   * Înregistrează un serviciu TRANSIENT
   */
  registerTransient<T>(token: string, factory: () => T): void {
    this.register(token, factory, ServiceLifetime.TRANSIENT)
  }

  /**
   * Rezolvă (resolve) un serviciu pe baza token-ului
   */
  resolve<T>(token: string): T {
    const registration = this.services.get(token)

    if (!registration) {
      throw new Error(`[DI] Service not registered: ${token}`)
    }

    switch (registration.lifetime) {
      case ServiceLifetime.SINGLETON:
        // Returnează aceeași instanță mereu
        if (!registration.instance) {
          console.log(`[DI] Creating SINGLETON instance: ${token}`)
          registration.instance = registration.factory()
        } else {
          console.log(`[DI] Reusing SINGLETON instance: ${token}`)
        }
        return registration.instance

      case ServiceLifetime.SCOPED:
        // Returnează aceeași instanță per scope (request)
        if (!this.scopedInstances.has(token)) {
          console.log(`[DI] Creating SCOPED instance: ${token}`)
          this.scopedInstances.set(token, registration.factory())
        } else {
          console.log(`[DI] Reusing SCOPED instance: ${token}`)
        }
        return this.scopedInstances.get(token)

      case ServiceLifetime.TRANSIENT:
        // Creează o instanță nouă de fiecare dată
        console.log(`[DI] Creating TRANSIENT instance: ${token}`)
        return registration.factory()

      default:
        throw new Error(`[DI] Unknown lifetime: ${registration.lifetime}`)
    }
  }

  /**
   * Curăță instanțele scoped (la sfârșitul request-ului)
   */
  clearScope(): void {
    console.log(`[DI] Clearing scoped instances (${this.scopedInstances.size} instances)`)
    this.scopedInstances.clear()
  }

  /**
   * Listează toate serviciile înregistrate
   */
  listServices(): string[] {
    return Array.from(this.services.keys())
  }

  /**
   * Obține informații despre un serviciu
   */
  getServiceInfo(token: string): { lifetime: ServiceLifetime; hasInstance: boolean } | null {
    const registration = this.services.get(token)
    if (!registration) return null

    return {
      lifetime: registration.lifetime,
      hasInstance: registration.lifetime === ServiceLifetime.SINGLETON && !!registration.instance,
    }
  }
}

/**
 * Container global pentru aplicație
 */
export const container = new DIContainer()
