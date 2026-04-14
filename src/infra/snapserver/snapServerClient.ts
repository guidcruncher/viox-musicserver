import { AxiosInstance } from "axios"

import { axiosFactory } from "@/infra/axiosFactory"

import {
  JsonRpcRequest,
  JsonRpcResponse,
  SnapserverSetVolumeParams,
  SnapserverStatus,
} from "./types"

export class SnapserverClient {
  private http: AxiosInstance

  constructor(baseURL = "http://localhost:1780/jsonrpc") {
    this.http = axiosFactory({
      baseURL,
      timeout: 2000,
      headers: { "Content-Type": "application/json" },
    })
  }

  private async rpc<T>(method: string, params?: unknown): Promise<T> {
    const payload: JsonRpcRequest = {
      id: Date.now(),
      jsonrpc: "2.0",
      method,
      params,
    }

    const { data } = await this.http.post<JsonRpcResponse<T>>("", payload)

    if (data.error) {
      throw new Error(`Snapserver RPC Error: ${data.error.message}`)
    }

    return data.result as T
  }

  // ────────────────────────────────────────────────
  // Public API (minimal)
  // ────────────────────────────────────────────────

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
