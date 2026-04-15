# **VIOX** Roadmap
  
## Library Management
 
A unified library layer that merges all media types into a consistent browsing and search experience.

Features

- Unified library view (music, podcasts, radio).
- Smart playlists (recently added, unplayed podcasts, most played).
- Deduplication and conflict resolution.
- Change detection for file updates.
- Search and filtering across all media types.

---


## Capabilities API

A declarative **API** that tells the UI exactly what each item, source, and zone supports, eliminating guesswork and hard‑coded assumptions.

Levels

- Global capabilities.
- Source‑level capabilities (music, podcasts, radio).
- Item‑level capabilities (per **VIOXID**).
- Zone‑level capabilities.

Examples

- Seekable.
- ResumeAllowed.
- Playback speed.
- Skip silence.
- Live metadata.
- Downloadable.
- Multi‑zone routing.

Role

The UI becomes adaptive and future‑proof, with behaviour driven entirely by backend‑declared capabilities.

## Cron and Maintenance Tasks

A predictable maintenance cycle that keeps the system fresh, healthy, and responsive.

Frequent

- Podcast feed polling (30–60 minutes).
- Session consolidation (10–15 minutes).
- Resume position persistence (30 minutes).

Daily

- Metadata enrichment.
- Library integrity checks.
- Recommendation updates.
- Cache cleanup.
- Backups.

Weekly

- Deep library scan.
- **MBID** retry and metadata refresh.
- Station directory refresh.
- Similarity graph rebuild.

Monthly

- Full metadata audit.
- Fingerprint verification.
- Recommendation model refresh.

---
