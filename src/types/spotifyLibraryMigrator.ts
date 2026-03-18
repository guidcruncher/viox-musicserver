export interface SpotifyLibraryMigrator {
  migrateUserLibrary(): Promise<SpotifyLibraryMigrationResult>;
}
