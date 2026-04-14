export interface SqliteBackupResult {
  source: string
  destination: string
  bytes: number
  durationMs: number
}

export interface HouseKeepingStore {
  vacuum(threshold: number): Promise<void>
  backup(): Promise<SqliteBackupResult | undefined>
}
