export interface Importers {
  spotify: {
    importUserPlaylists(): Promise<void>
  }
}
