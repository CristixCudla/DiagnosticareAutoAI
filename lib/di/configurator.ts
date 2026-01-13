import { container } from "./container"
import { UserService } from "../services/user.service"
import { DiagnosticService } from "../services/diagnostic.service"
import { LoggerService } from "../services/logger.service"
import { CacheService } from "../services/cache.service"

/**
 * Service Tokens (constante pentru identificarea serviciilor)
 */
export const SERVICE_TOKENS = {
  USER_SERVICE: "IUserService",
  DIAGNOSTIC_SERVICE: "IDiagnosticService",
  CACHE_SERVICE: "ICacheService",
  LOGGER_SERVICE: "ILoggerService",
} as const

/**
 * DI Configurator (similar cu ContainerConfigurer.ConfigureContainer() din .NET)
 * Configurează toate serviciile aplicației cu lifetime-urile lor
 */
export class DIConfigurator {
  /**
   * Configurare pentru SINGLETON (implicit)
   * Toate serviciile sunt SINGLETON - o singură instanță pentru întreaga aplicație
   */
  static configureSingleton(): void {
    console.log("[DI] Configuring container with SINGLETON lifetime")

    // Register Logger Service as SINGLETON
    container.registerSingleton(SERVICE_TOKENS.LOGGER_SERVICE, () => LoggerService.getInstance())

    // Register Cache Service as SINGLETON
    container.registerSingleton(SERVICE_TOKENS.CACHE_SERVICE, () => new CacheService())

    // Register User Service as SINGLETON
    container.registerSingleton(SERVICE_TOKENS.USER_SERVICE, () => new UserService())

    // Register Diagnostic Service as SINGLETON
    container.registerSingleton(SERVICE_TOKENS.DIAGNOSTIC_SERVICE, () => new DiagnosticService())

    console.log("[DI] Container configured with services:", container.listServices())
  }

  /**
   * Configurare pentru SCOPED
   * Serviciile sunt SCOPED - o instanță per request/context
   */
  static configureScoped(): void {
    console.log("[DI] Configuring container with SCOPED lifetime")

    // Logger și Cache rămân SINGLETON (sunt shared resources)
    container.registerSingleton(SERVICE_TOKENS.LOGGER_SERVICE, () => LoggerService.getInstance())

    container.registerSingleton(SERVICE_TOKENS.CACHE_SERVICE, () => new CacheService())

    // User și Diagnostic Services sunt SCOPED
    container.registerScoped(SERVICE_TOKENS.USER_SERVICE, () => new UserService())

    container.registerScoped(SERVICE_TOKENS.DIAGNOSTIC_SERVICE, () => new DiagnosticService())

    console.log("[DI] Container configured with services:", container.listServices())
  }

  /**
   * Configurare pentru TRANSIENT
   * Toate serviciile sunt TRANSIENT - instanță nouă la fiecare utilizare
   */
  static configureTransient(): void {
    console.log("[DI] Configuring container with TRANSIENT lifetime")

    // Toate serviciile sunt TRANSIENT
    container.registerTransient(SERVICE_TOKENS.LOGGER_SERVICE, () => LoggerService.getInstance())

    container.registerTransient(SERVICE_TOKENS.CACHE_SERVICE, () => new CacheService())

    container.registerTransient(SERVICE_TOKENS.USER_SERVICE, () => new UserService())

    container.registerTransient(SERVICE_TOKENS.DIAGNOSTIC_SERVICE, () => new DiagnosticService())

    console.log("[DI] Container configured with services:", container.listServices())
  }

  /**
   * Configurare MIXED (cel mai recomandat pentru producție)
   * - SINGLETON pentru servicii stateless (Logger, Cache)
   * - SCOPED pentru servicii cu state per request (User, Diagnostic)
   */
  static configureMixed(): void {
    console.log("[DI] Configuring container with MIXED lifetime strategy")

    // SINGLETON pentru servicii globale
    container.registerSingleton(SERVICE_TOKENS.LOGGER_SERVICE, () => LoggerService.getInstance())

    container.registerSingleton(SERVICE_TOKENS.CACHE_SERVICE, () => new CacheService())

    // SCOPED pentru servicii cu business logic
    container.registerScoped(SERVICE_TOKENS.USER_SERVICE, () => new UserService())

    container.registerScoped(SERVICE_TOKENS.DIAGNOSTIC_SERVICE, () => new DiagnosticService())

    console.log("[DI] Container configured with MIXED strategy:", container.listServices())
  }
}

// Configurare implicită (poți schimba aici pentru testare)
// Decomentează linia dorită:

// DIConfigurator.configureSingleton()  // Toate SINGLETON
// DIConfigurator.configureScoped()     // User/Diagnostic SCOPED
DIConfigurator.configureMixed() // Recomandat: Mixed strategy
// DIConfigurator.configureTransient()  // Toate TRANSIENT (pentru testare)
