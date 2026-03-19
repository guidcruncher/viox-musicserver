export interface JsonRpcRequest {
  id: number
  jsonrpc: "2.0"
  method: string
  params?: unknown
}

export interface JsonRpcResponse<T> {
  id: number
  jsonrpc: "2.0"
  result?: T
  error?: { code: number; message: string }
}
export interface SnapserverStatus {
  server: SnapServerRoot
}

export interface SnapServerRoot {
  groups: SnapGroup[]
  server: SnapServerInfo
  streams: SnapStream[]
}

//
// GROUPS
//

export interface SnapGroup {
  id: string
  name: string
  muted: boolean
  stream_id: string
  clients: SnapClient[]
}

//
// CLIENTS
//

export interface SnapClient {
  id: string
  connected: boolean
  config: SnapClientConfig
  host: SnapClientHost
  lastSeen: SnapTimestamp
  snapclient: SnapClientInfo
}

export interface SnapClientConfig {
  instance: number
  latency: number
  name: string
  volume: SnapVolume
}

interface SnapVolume {
  muted: boolean
  percent: number
}

export interface SnapClientHost {
  arch: string
  ip: string
  mac: string
  name: string
  os: string
}

export interface SnapTimestamp {
  sec: number
  usec: number
}

export interface SnapClientInfo {
  name: string
  protocolVersion: number
  version: string
}

//
// SERVER INFO
//

interface SnapServerInfo {
  host: SnapServerHost
  snapserver: SnapServerMeta
}

interface SnapServerHost {
  arch: string
  ip: string
  mac: string
  name: string
  os: string
}

interface SnapServerMeta {
  controlProtocolVersion: number
  name: string
  protocolVersion: number
  version: string
}

//
// STREAMS
//

interface SnapStream {
  id: string
  properties: SnapStreamProperties
  status: string
  uri: SnapUri
}

interface SnapStreamProperties {
  canControl: boolean
  canGoNext: boolean
  canGoPrevious: boolean
  canPause: boolean
  canPlay: boolean
  canSeek: boolean
}

interface SnapUri {
  fragment: string
  host: string
  path: string
  query: SnapUriQuery
  raw: string
  scheme: string
}

interface SnapUriQuery {
  chunk_ms: string
  codec: string
  mode: string
  name: string
  sampleformat: string
}

export interface SnapserverSetVolumeParams {
  id: string
  volume: {
    percent: number
    muted: boolean
  }
}
