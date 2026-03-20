import { SnapserverClient } from "./snapServerClient"
import { flattenClients } from "./speakerMapper"
import type {   SnapserverStatus } from "./types"

export class SnapserverOrchestrator {
  constructor(private snap = new SnapserverClient()) {}

  async getFullStatus(): Promise<SnapserverStatus> {
    return this.snap.getStatus()
  }

  async getSpeakers() {
    const status = await this.snap.getStatus()
    return flattenClients(status)
  }

  async setVolume(clientId: string, percent: number, muted: boolean) {
    return this.snap.setClientVolume({
      id: clientId,
      volume: { percent, muted },
    })
  }

  async setLatency(clientId: string, latency: number) {
    return this.snap.setClientLatency(clientId, latency)
  }

  async moveClientToStream(groupId: string, streamId: string) {
    return this.snap.setStream(groupId, streamId)
  }

  async muteAllClients() {
    const clients = await this.getSpeakers()

    await Promise.all(
      clients.map((c: any) =>
        this.snap.setClientVolume({
          id: c.id,
          volume: { percent: c.config.volume.percent, muted: true },
        }),
      ),
    )

    return { count: clients.length }
  }

  async unmuteAllClients() {
    const clients = await this.getSpeakers()

    await Promise.all(
      clients.map((c: any) =>
        this.snap.setClientVolume({
          id: c.id,
          volume: { percent: c.volume, muted: false },
        }),
      ),
    )

    return { count: clients.length }
  }

  async setAllVolume(percent: number) {
    const clients = await this.getSpeakers()

    await Promise.all(
      clients.map((c: any) =>
        this.snap.setClientVolume({
          id: c.id,
          volume: { percent: percent, muted: c.muted },
        }),
      ),
    )

    return { count: clients.length, percent }
  }
}
