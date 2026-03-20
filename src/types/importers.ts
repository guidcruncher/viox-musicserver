export interface Importers {
  spotify: {
    importUserLibrary(itemType?: string): Promise<void>
  }
}
