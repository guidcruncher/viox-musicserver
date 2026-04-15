//
// BASE NODE
//
export interface BaseNode {
  element: "outline"
  text: string
  children?: TuneInNode[]
}

//
// CATEGORY NODE (no type, has key)
//
export interface CategoryNode extends BaseNode {
  key: string
  type?: undefined
}

//
// DIRECTORY LINK NODE (type: "link")
// e.g. "Asia", "Music", "Local Radio"
//
export interface LinkNode extends BaseNode {
  type: "link"
  URL: string
  guide_id?: string
  key?: string
}

//
// STATION NODE (type: "audio")
// e.g. actual playable stations
//
export interface StationNode extends BaseNode {
  type: "audio"
  URL: string
  bitrate?: string
  reliability?: string
  guide_id: string
  subtext?: string
  genre_id?: string
  formats?: string
  show_id?: string
  item?: string
  image?: string
  current_track?: string
  now_playing_id?: string
  preset_id?: string
}

//
// DISCRIMINATED UNION
//
export type TuneInNode = CategoryNode | LinkNode | StationNode

//
// FULL RESPONSE TYPE
//
export interface TuneInBrowseResponse {
  head: {
    title: string
    status: string
  }
  body: TuneInNode[]
}

function detectNodeType(raw: any): TuneInNode["type"] | "category" {
  if (raw.type === "audio") return "audio"
  if (raw.type === "link") return "link"
  if (!raw.type && raw.key) return "category"
  return "category"
}

function convertToTuneInNode(raw: any): TuneInNode {
  const nodeType = detectNodeType(raw)

  const base: BaseNode = {
    element: "outline",
    text: raw.text ?? "",
    children: Array.isArray(raw.children) ? raw.children.map(convertToTuneInNode) : undefined,
  }

  switch (nodeType) {
    case "audio":
      return {
        ...base,
        type: "audio",
        URL: raw.URL,
        bitrate: raw.bitrate,
        reliability: raw.reliability,
        guide_id: raw.guide_id,
        subtext: raw.subtext,
        genre_id: raw.genre_id,
        formats: raw.formats,
        show_id: raw.show_id,
        item: raw.item,
        image: raw.image,
        current_track: raw.current_track,
        now_playing_id: raw.now_playing_id,
        preset_id: raw.preset_id,
      }

    case "link":
      return {
        ...base,
        type: "link",
        URL: raw.URL,
        guide_id: raw.guide_id,
        key: raw.key,
      }

    case "category":
    default:
      return {
        ...base,
        key: raw.key,
      }
  }
}

export function flattenNodes(response: TuneInBrowseResponse): TuneInNode[] {
  const result: TuneInNode[] = []

  function walk(raw: any) {
    const node = convertToTuneInNode(raw)
    result.push(node)

    if (node.children) {
      for (const child of node.children) {
        walk(child)
      }
    }
  }

  for (const item of response.body) {
    walk(item)
  }

  return result
}
