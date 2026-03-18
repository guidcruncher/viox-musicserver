import { Episode } from "./types" // adjust path
// import { Podcast } from './types' // if needed for joins

export function mapEpisodeRow(row: any): Episode {
  return {
    id: row.id,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    linkUrl: row.link_url ?? undefined,

    mediaUrl: row.media_url, // required in DB + TS

    pubDate: row.pub_date ?? undefined,
    duration: row.duration != null ? Number(row.duration) : undefined,

    // Not included in this table — only set when joining
    podcast: undefined,
  }
}

export function mapEpisodeRows(rows: any[]): Episode[] {
  if (!rows) return []
  return rows.map(mapEpisodeRow)
}
