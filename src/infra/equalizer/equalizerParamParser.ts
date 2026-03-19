// EqualizerParamParser.ts
import type { RootObject } from "./parser"
import { extractEqSettings } from "./parser"

export class EqualizerParamParser {
  parseLevels(json: RootObject): Record<string, number> {
    return extractEqSettings(json)
  }
}
