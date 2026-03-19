import { MediaSourceRef } from "./mediaSourceRef"

export const buildSourceKey = (ref: MediaSourceRef): string =>
  `${ref.source}:${ref.itemType}:${ref.sourceId}:${ref.parentSourceId ?? ""}`
