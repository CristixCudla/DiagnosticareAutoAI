/**
 * Interface pentru Database Context (similar cu ICarDbContext din tema)
 */
export interface ISupabaseContext {
  getClient(): any
  query<T>(table: string): any
}

/**
 * Interface pentru User Service
 */
export interface IUserService {
  getAllActiveUsers(): Promise<any[]>
  getUserWithDetails(userId: string): Promise<any>
  updateUser(userId: string, data: any): Promise<any>
  deleteUser(userId: string): Promise<boolean>
  getUserStatistics(userId: string): Promise<any>
}

/**
 * Interface pentru Diagnostic Service
 */
export interface IDiagnosticService {
  canUserDiagnose(userId: string): Promise<{ can: boolean; reason?: string }>
  performDiagnostic(userId: string, vehicleInfo: any, symptoms: string): Promise<any>
  getUserDiagnostics(userId: string): Promise<any[]>
  getDiagnosticStatistics(userId: string): Promise<any>
}

/**
 * Interface pentru Subscription Service
 */
export interface ISubscriptionService {
  getUserSubscription(userId: string): Promise<any>
  updateSubscription(userId: string, tier: string): Promise<any>
  canUpgrade(userId: string): Promise<boolean>
}

/**
 * Interface pentru Cache Service
 */
export interface ICacheService {
  get<T>(key: string): T | null
  set<T>(key: string, value: T, ttl?: number): void
  delete(key: string): void
  clear(): void
}

/**
 * Interface pentru Logger Service
 */
export interface ILoggerService {
  info(message: string, meta?: any): void
  error(message: string, error?: any, meta?: any): void
  warn(message: string, meta?: any): void
}
