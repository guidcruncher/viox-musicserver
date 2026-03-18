import { db } from "../../repositories/db"
import { rfcToIso8601 } from "../../types/formatters"
import { mapEpisodeRow, mapEpisodeRows } from "./mapEpisodeRow"
import { mapPodcastRow, mapPodcastRows } from "./mapPodcastRow"
import { Episode, Podcast } from "./types"

export class SqliteCache {
  //
  // PODCASTS
  //

  upsertPodcast(p: Podcast): void {
    db.prepare(
      `INSERT INTO podcasts (
        id, title, description, image_url, link_url, language,
        is_explicit, is_public, last_episode_pub_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        image_url = excluded.image_url,
        link_url = excluded.link_url,
        language = excluded.language,
        is_explicit = excluded.is_explicit,
        is_public = excluded.is_public,
        last_episode_pub_date = excluded.last_episode_pub_date`,
    ).run(
      `podverse:podcast:${p.id}`,
      p.title ?? null,
      p.description ?? null,
      p.imageUrl ?? null,
      p.linkUrl ?? null,
      p.language ?? null,
      p.isExplicit ? 1 : 0,
      p.isPublic ? 1 : 0,
      rfcToIso8601(p.lastEpisodePubDate) ?? null,
    )
  }

  //
  // EPISODES
  //

  setListened(episodeId: string, listened: boolean): void {
    const currentDate = new Date().toISOString()
    db.prepare(
      `UPDATE episodes SET listen_date = ?, listened = ?
         WHERE id = ?`,
    ).run(listened ? currentDate : "", listened ? 1 : 0, episodeId)
  }

  upsertEpisode(e: Episode): void {
    db.prepare(
      `INSERT INTO episodes (
        id, podcast_id, title, description, image_url, link_url,
        media_url, pub_date, duration, listen_date, listened
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        image_url = excluded.image_url,
        link_url = excluded.link_url,
        media_url = excluded.media_url,
        pub_date = excluded.pub_date,
        duration = excluded.duration`,
    ).run(
      `podverse:episode:${e.id}`,
      e.podcast ? `podverse:podcast:${e.podcast.id}` : null,
      e.title ?? null,
      e.description ?? null,
      e.imageUrl ?? null,
      e.linkUrl ?? null,
      e.mediaUrl,
      rfcToIso8601(e.pubDate) ?? null,
      e.duration ?? null,
      "",
      0,
    )
  }

  //
  // READERS
  //

  getPodcast(id: string): Podcast | undefined {
    return mapPodcastRow(db.prepare(`SELECT * FROM podcasts WHERE id = ?`).get(id))
  }

  getEpisode(id: string): Episode | undefined {
    return mapEpisodeRow(db.prepare(`SELECT * FROM episodes WHERE Id = ?`).get(id))
  }

  getEpisodesForPodcast(podcastId: string): Episode[] {
    return mapEpisodeRows(
      db
        .prepare(`SELECT * FROM episodes WHERE podcast_id = ? ORDER BY pub_date DESC`)
        .all(podcastId),
    )
  }

  getAllPodcasts(): Podcast[] {
    return mapPodcastRows(db.prepare(`SELECT * FROM podcasts ORDER BY title`).all())
  }

  getAllEpisodes(): Episode[] {
    return mapEpisodeRows(db.prepare(`SELECT * FROM episodes ORDER BY pub_date DESC`).all())
  }

  getEpisodes(podcastId: string): Episode[] {
    return mapEpisodeRows(
      db
        .prepare(`SELECT * FROM episodes WHERE podcast_id = ? ORDER BY pub_date DESC`)
        .all(podcastId),
    )
  }
}
