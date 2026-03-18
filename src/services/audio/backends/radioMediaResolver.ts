import { radioProvider } from "../../radio/radioProvider"
import { BackendMediaResolver, ResolverContext } from "./backendMediaResolver"

export class RadioMediaResolver implements BackendMediaResolver {
  async resolve(ctx: ResolverContext) {
    const { parsed, logger } = ctx
    logger.debug(`Looking in radio provider ${parsed.type}`)

    const service = await radioProvider(parsed.type)
    if (!service) return undefined

    const station = await service.getStation(parsed.id)
    logger.debug(`Radio ${JSON.stringify(station)}`)
    return station
  }
}
