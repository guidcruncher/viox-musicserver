export interface Subscription {
  id: string
  source: string
  item_type: string
  source_id: string
  parent_source_id: string | null
  source_uri: string | null
  title: string
  subtitle: string | null
  image_url: string | null
  created_at: string
  updated_at: string
  lastpublished_at: number
  lastlistened_at: number
}

export interface CreateSubscriptionInput {
  id: string
  source: string
  item_type: string
  source_id: string
  parent_source_id?: string | null
  source_uri?: string | null
  title: string
  subtitle?: string | null
  image_url?: string | null
  lastpublished_at: number
  lastlistened_at: number
}

export interface SubscriptionEpisode {
  id: string
  source: string
  item_type: string
  source_id: string
  parent_source_id: string | null
  source_uri: string | null
  title: string
  subtitle: string | null
  image_url: string | null
  duration_ms: number | null
  listened: number
  created_at: string
  updated_at: string
  published_at: number
}

export interface CreateSubscriptionEpisodeInput {
  id: string
  source: string
  item_type: string
  source_id: string
  parent_source_id?: string | null
  source_uri?: string | null
  title: string
  subtitle?: string | null
  image_url?: string | null
  duration_ms?: number | null
  listened?: number
  published_at: number
}
