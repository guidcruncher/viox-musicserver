import { LocalFileSearch } from "../../medialibrary/localFileSearch"
import { BackendMediaResolver, ResolverContext } from "./backendMediaResolver"

export class LocalMediaResolver implements BackendMediaResolver {
  async resolve(ctx: ResolverContext) {
    ctx.logger.debug("Looking in Local files")
    const local = new LocalFileSearch()
    await local.buildIndex()
    return local.getFileById(ctx.id)
  }
}
