export const rfcToIso8601 = (input?: string): string => {
  if (!input) {
    return ""
  }

  // Let JavaScript do the heavy lifting — it fully supports RFC 5322/2822
  const date = new Date(input)

  if (isNaN(date.getTime())) {
    return ""
  }

  return date.toISOString()
}

//
// Core Domain Types
//

export interface Author {
  id: string
  name?: string
  url?: string
  podcastId?: string
}

export interface Category {
  id: string
  name?: string
  parentId?: string
  createdAt?: string
  updatedAt?: string
  slug?: string
  title?: string
  fullPath?: string
  categories?: Category[]
  category?: Category
}

export interface CategoryItem {
  id: string
  slug: string
  title: string
  categories?: CategoryItem[]
  category?: CategoryItem
}

export interface FeedUrl {
  id: string
  isAuthority: boolean
  url: string
  createdAt: string
  updatedAt: string
}

export interface Podcast {
  id: string
  title?: string
  description?: string
  imageUrl?: string
  linkUrl?: string
  language?: string
  funding?: string[]
  isExplicit?: boolean
  isPublic?: boolean
  lastEpisodePubDate?: string

  authors?: Author[]
  categories?: Category[]
  feedUrls?: FeedUrl[]
}

export interface Episode {
  id: string
  title?: string
  description?: string
  imageUrl?: string
  linkUrl?: string

  mediaUrl: string
  pubDate?: string
  duration?: number

  podcast?: Podcast
}

//
// MediaRef (clips, bookmarks, etc.)
//

export interface MediaRef {
  id: string

  title?: string
  description?: string

  startTime: number
  endTime?: number

  isPublic?: boolean
  isDeleted?: boolean

  episode?: Episode
  podcast?: Podcast
}

//
// Playlist
//

export interface Playlist {
  id: string

  title?: string
  description?: string
  isPublic?: boolean

  // Order of mediaRef IDs
  itemsOrder?: string[]

  // Full objects (optional)
  mediaRefs?: MediaRef[]

  // Owner
  userId?: string
}

//
// User
//

export interface User {
  id: string

  email: string
  name?: string
  imageUrl?: string

  // Public-facing content
  playlists?: Playlist[]
  mediaRefs?: MediaRef[]
}
