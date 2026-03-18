import axios, { AxiosInstance } from "axios"

import { getLogger } from "../../logger"
import {
  JsonRpcRequest,
  JsonRpcResponse,
  SnapserverSetVolumeParams,
  SnapserverStatus,
} from "./snapserver.types"

export class SnapserverClient {
  private http: AxiosInstance
  private logger: any

  constructor() {
    this.logger = getLogger()
    this.http = axios.create({
      baseURL: "http://localhost:1780/jsonrpc",
      timeout: 2000,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  private async rpc<T>(method: string, params?: unknown): Promise<T> {
    const payload: JsonRpcRequest = {
      id: Date.now(),
      jsonrpc: "2.0",
      method,
      params,
    }

    this.logger.debug(`Snapserver request ${JSON.stringify(payload)}`)
    const { data } = await this.http.post<JsonRpcResponse<T>>("", payload)

    if (data.error) {
      this.logger.error(`Snapserver RPC Error: ${data.error.message}`)
      throw new Error(`Snapserver RPC Error: ${data.error.message}`)
    }

    return data.result as T
  }

  // ---- Public API ---------------------------------------------------------

  getStatus(): Promise<SnapserverStatus> {
    return this.rpc("Server.GetStatus")
  }

  setClientVolume(params: SnapserverSetVolumeParams) {
    return this.rpc("Client.SetVolume", params)
  }

  setClientLatency(id: string, latency: number) {
    return this.rpc("Client.SetLatency", { id, latency })
  }

  setStream(groupId: string, streamId: string) {
    return this.rpc("Group.SetStream", { id: groupId, stream_id: streamId })
  }
}
