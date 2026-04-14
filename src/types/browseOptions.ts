import { MediaSourceRef } from "./index"

export interface BrowseOptions {
  ref?: MediaSourceRef
  kind: string
  cursor?: string
  source?: string
  offset?: number
  limit?: number
}
