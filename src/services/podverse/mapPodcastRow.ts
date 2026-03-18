import { Podcast } from "./types"

export function mapPodcastRow(row: any): Podcast {
  return {
    id: row.id,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    linkUrl: row.link_url ?? undefined,
    language: row.language ?? undefined,

    // Not in DB — default to empty arrays unless you prefer undefined
    funding: [],
    authors: [],
    categories: [],
    feedUrls: [],

    isExplicit: row.is_explicit != null ? Boolean(row.is_explicit) : undefined,
    isPublic: row.is_public != null ? Boolean(row.is_public) : undefined,

    lastEpisodePubDate: row.last_episode_pub_date ?? undefined,
  }
}

export function mapPodcastRows(rows: any[]): Podcast[] {
  if (!rows) return []
  return rows.map(mapPodcastRow)
}
