import { MediaSourceRef } from "./index"

export interface BrowseOptions {
  ref?: MediaSourceRef
  kind: "root" | "children" | "related" | "category"
  cursor?: string
}
