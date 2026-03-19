// EqualizerParamParser.ts
import { extractEqSettings } from " ./parser"

import type { RootObject } from "./parser"

export class EqualizerParamParser {
  parseLevels(json: RootObject): Record<string, number> {
    return extractEqSettings(json)
  }
}
