import { db } from "./db"
import { EqBandRecord, EqPresetRecord } from "./types"

class EqPresetRepository {
  findAll(): EqPresetRecord[] {
    const stmt = db.prepare(`
      SELECT * FROM eq_presets
      ORDER BY name ASC
    `)
    return stmt.all() as EqPresetRecord[]
  }

  findOneBy(column: string, value: any): EqPresetRecord | null {
    const stmt = db.prepare(`
      SELECT * FROM eq_presets
      WHERE ${column} = ?
      LIMIT 1
    `)
    return stmt.get(value) as EqPresetRecord | null
  }

  findAllWithBands(): (EqPresetRecord & { bands: EqBandRecord[] })[] {
    const presets = this.findAll()

    const bandStmt = db.prepare(`
      SELECT preset_id, frequency, gain_db
      FROM eq_preset_bands
      ORDER BY frequency ASC
    `)

    const bands = bandStmt.all() as EqBandRecord[]

    const grouped = new Map<number, EqBandRecord[]>()

    for (const b of bands) {
      if (!grouped.has(b.preset_id)) grouped.set(b.preset_id, [])
      grouped.get(b.preset_id)!.push(b)
    }

    return presets.map((p) => ({
      ...p,
      bands: grouped.get(p.id) ?? [],
    }))
  }

  findByNameWithBands(name: string): (EqPresetRecord & { bands: EqBandRecord[] }) | null {
    const preset = this.findOneBy("name", name)
    if (!preset) return null

    const stmt = db.prepare(`
      SELECT frequency, gain_db
      FROM eq_preset_bands
      WHERE preset_id = ?
      ORDER BY frequency ASC
    `)

    const bands = stmt.all(preset.id) as EqBandRecord[]

    return { ...preset, bands }
  }

  createPreset(name: string, gain: number): number {
    const stmt = db.prepare(`
      INSERT INTO eq_presets (name, gain)
      VALUES (?, ?)
    `)

    const result = stmt.run(name, gain)
    return result.lastInsertRowid as number
  }

  insertBand(presetId: number, frequency: string, gainDb: number): void {
    const stmt = db.prepare(`
      INSERT INTO eq_preset_bands (preset_id, frequency, gain_db)
      VALUES (?, ?, ?)
    `)

    stmt.run(presetId, frequency, gainDb)
  }
}

export const eqPresetRepository = new EqPresetRepository()
