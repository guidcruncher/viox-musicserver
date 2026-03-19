// infra/podverse/PodverseWebClient.ts
import axios, { AxiosInstance } from "axios";
import { RssEpisodeParser } from "./RssEpisodeParser";

export class PodverseWebClient {
  readonly http: AxiosInstance;

  constructor(baseURL = "https://api.podverse.fm/api/v1", token?: string) {
    this.http = axios.create({
      baseURL,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  }

  setToken(token: string) {
    this.http.defaults.headers.Authorization = `Bearer ${token}`;
  }

  // ────────────────────────────────────────────────
  // Podcasts
  // ────────────────────────────────────────────────
  async getPodcast(id: string) {
    return (await this.http.get(`/podcast/${id}`)).data;
  }

  // ────────────────────────────────────────────────
  // Episodes (with RSS fallback)
  // ────────────────────────────────────────────────
  async getEpisodesForPodcast(podcastId: string) {
    const res = await this.http.get("/episode", {
      params: {
        podcastId,
        includePodcast: true,
        sort: "pubDate",
      },
    });

    const episodes = res.data?.[0] ?? [];

    if (episodes.length > 0) {
      return episodes;
    }

    // Fallback to RSS
    const podcast = await this.getPodcast(podcastId);
    const feedUrl = podcast.feedUrls?.[0]?.url;

    if (!feedUrl) return [];

    return await RssEpisodeParser.parse(podcastId, feedUrl);
  }

  async getEpisode(id: string) {
    try {
      return (await this.http.get(`/episode/${id}`)).data;
    } catch {
      // fallback: RSS lookup
      const podcastId = id.split(":").pop();
      const podcast = await this.getPodcast(podcastId);
      const feedUrl = podcast.feedUrls?.[0]?.url;

      if (!feedUrl) return null;

      const episodes = await RssEpisodeParser.parse(podcastId, feedUrl);
      return episodes.find((e) => e.id.endsWith(id)) ?? null;
    }
  }
}
