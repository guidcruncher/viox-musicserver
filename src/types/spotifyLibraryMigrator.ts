import { SpotifyLibraryMigrationResult } from "./spotifyLibraryMigrationResult"

export interface SpotifyLibraryMigrator {
  migrateUserLibrary(): Promise<SpotifyLibraryMigrationResult>
}
