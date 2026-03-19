// --- Type Definitions ---

interface SpaPropParam {
  params?: (string | number | boolean)[]
  [key: string]: any
}

interface NodeInfo {
  props?: Record<string, any>
  params?: {
    Props?: SpaPropParam[]
    [key: string]: any
  }
  [key: string]: any
}

interface PipeWireNode {
  id: number
  type: string
  info?: NodeInfo
  [key: string]: any
}

export type RootObject = PipeWireNode[]

// --- Parsing Logic ---

/**
 * Converts a flat SPA params array into a Record<string, number>.
 * It specifically strips the "eq_node:" prefix from keys.
 */
function parseAndCleanEqParams(flatParams: (string | number | boolean)[]): Record<string, number> {
  const result: Record<string, number> = {}

  if (!Array.isArray(flatParams)) {
    return result
  }

  for (let i = 0; i < flatParams.length; i += 2) {
    const rawKey = flatParams[i]
    const value = i + 1 < flatParams.length ? flatParams[i + 1] : null

    // Ensure key is a string and value is a number before adding
    if (typeof rawKey === "string" && typeof value === "number") {
      // Strip the 'eq_node:' prefix
      const cleanKey = rawKey.replace("eq_node:", "")
      result[cleanKey] = value
    }
  }

  return result
}

/**
 * Traverses the PipeWire JSON to find EQ parameters specifically.
 */
export function extractEqSettings(jsonData: RootObject): Record<string, number> {
  for (const node of jsonData) {
    const props = node.info?.params?.Props

    if (Array.isArray(props)) {
      for (const propBlock of props) {
        if (propBlock.params && Array.isArray(propBlock.params)) {
          // Check if this block contains 'eq_node' keys
          const hasEqNode = propBlock.params.some(
            (item) => typeof item === "string" && item.startsWith("eq_node"),
          )

          if (hasEqNode) {
            return parseAndCleanEqParams(propBlock.params)
          }
        }
      }
    }
  }

  return {}
}
