export interface Importers {
  spotify: {
    importUserPlaylists(): Promise<void>
  }
  local: {
    scan(): Promise<void>
  }
}
