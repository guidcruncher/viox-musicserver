import { getLogger } from "../../../logger"
import { MediaItem } from "../../../types/media-types"
import { parseId } from "../../idParser"

export type ParsedId = NonNullable<ReturnType<typeof parseId>>

export type ResolverContext = {
  id: string
  parsed: ParsedId // <-- guaranteed non-null
  opts: { podcastId?: string; subtype?: string }
  logger: ReturnType<typeof getLogger>
}

export interface BackendMediaResolver {
  resolve(ctx: ResolverContext): Promise<MediaItem | undefined>
}
