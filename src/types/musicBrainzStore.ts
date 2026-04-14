import { MusicBrainzMapRow } from "@/infra/musicBrainzStore"

/**
 * Interface for MusicBrainz ID mapping and resolution.
 * Handles the association between local/external identifiers and MBIDs.
 */
export interface MusicBrainzStore {
  /**
   * Retrieves a mapping for a specific ISRC and lookup key pair.
   */
  getMapping(isrc: string, key: string): MusicBrainzMapRow | undefined

  /**
   * Retrieves all mappings associated with a specific ISRC.
   */
  getMappingsByIsrc(isrc: string): MusicBrainzMapRow[]

  /**
   * Persists a mapping. If the ISRC/Key combination exists, updates the MBID.
   */
  upsert(isrc: string, key: string, mbid: string): void

  /**
   * Performs a bulk upsert of multiple mappings within a single transaction.
   */
  upsertBatch(items: Omit<MusicBrainzMapRow, "id">[]): void

  /**
   * Removes a specific mapping.
   */
  removeMapping(isrc: string, key: string): void
}
