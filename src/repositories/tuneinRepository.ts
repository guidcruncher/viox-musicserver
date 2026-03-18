import { db } from "./db"

class TuneInRepository {
  async getRegions(): Promise<any[]> {
    const stmt = db.prepare(`
      SELECT guide_id AS guideId,
             text
      FROM tunein_regions
      ORDER BY text ASC
    `)

    const rows = stmt.all()

    return Promise.resolve(
      rows.map((r: any) => ({
        code: r.guideId,
        name: r.text,
      })),
    )
  }
}

export const tuneInRepository = new TuneInRepository()
