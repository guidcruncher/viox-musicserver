import { db } from "@/infra/db"

import { EqBandRecord, EqPresetRecord } from "./types"

export interface EqPresetWithBands extends EqPresetRecord {
  bands: EqBandRecord[]
}

export class EqPresetStore {
  // ────────────────────────────────────────────────
  // READ
  // ────────────────────────────────────────────────

  getAll(): EqPresetRecord[] {
    return db
      .prepare(`SELECT id, name, gain FROM eq_presets ORDER BY name ASC`)
      .all() as EqPresetRecord[]
  }

  getById(id: number): EqPresetRecord | null {
    return (db.prepare(`SELECT id, name, gain FROM eq_presets WHERE id = ? LIMIT 1`).get(id) as EqPresetRecord | undefined) || null
  }

  getByName(name: string): EqPresetRecord | null {
    return (
      (db.prepare(`SELECT id, name, gain FROM eq_presets WHERE name = ? LIMIT 1`).get(name) as EqPresetRecord | undefined) || null
    )
  }

  getAllWithBands(): EqPresetWithBands[] {
    const presets = this.getAll()

    const bands = db
      .prepare(
        `SELECT preset_id, frequency, gain_db 
         FROM eq_preset_bands 
         ORDER BY frequency ASC`,
      )
      .all() as EqBandRecord[]

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

  getByNameWithBands(name: string): EqPresetWithBands | null {
    const preset = this.getByName(name)
    if (!preset) return null

    const bands = db
      .prepare(
        `SELECT preset_id, frequency, gain_db 
         FROM eq_preset_bands 
         WHERE preset_id = ? 
         ORDER BY frequency ASC`,
      )
      .all(preset.id) as EqBandRecord[]

    return { ...preset, bands }
  }

  // ────────────────────────────────────────────────
  // WRITE
  // ────────────────────────────────────────────────

  createPreset(name: string, gain: number): number {
    const result = db.prepare(`INSERT INTO eq_presets (name, gain) VALUES (?, ?)`).run(name, gain)

    return result.lastInsertRowid as number
  }

  addBand(presetId: number, frequency: string, gainDb: number): void {
    db.prepare(
      `INSERT INTO eq_preset_bands (preset_id, frequency, gain_db)
       VALUES (?, ?, ?)`,
    ).run(presetId, frequency, gainDb)
  }

  deletePreset(id: number): void {
    db.prepare(`DELETE FROM eq_preset_bands WHERE preset_id = ?`).run(id)
    db.prepare(`DELETE FROM eq_presets WHERE id = ?`).run(id)
  }

  updatePresetName(id: number, name: string): void {
    db.prepare(`UPDATE eq_presets SET name = ? WHERE id = ?`).run(name, id)
  }

  updatePresetGain(id: number, gain: number): void {
    db.prepare(`UPDATE eq_presets SET gain = ? WHERE id = ?`).run(gain, id)
  }
}

export const eqPresetStore = new EqPresetStore()
