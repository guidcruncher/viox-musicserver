import { SnapserverClient } from "./snapserver.client"
import { SnapClient, SnapGroup, SnapserverStatus } from "./snapserver.types"
import { flattenClients } from "./speakerMapper"

export class SnapserverOrchestrator {
  constructor(private snap = new SnapserverClient()) {}

  /**
   * Get full Snapserver status:
   * - groups
   * - clients
   * - streams
   * - server info
   */
  async getFullStatus(): Promise<SnapserverStatus> {
    return this.snap.getStatus()
  }

  async getSpeakers(): Promise<any> {
    const res = await this.snap.getStatus()
    return flattenClients(res)
  }

  /**
   * Set volume + mute state for a single client
   */
  async setVolume(clientId: string, percent: number, muted = false) {
    return this.snap.setClientVolume({
      id: clientId,
      volume: { percent, muted },
    })
  }

  /**
   * Set latency for a single client
   */
  async setLatency(clientId: string, latency: number) {
    return this.snap.setClientLatency(clientId, latency)
  }

  /**
   * Change the stream assigned to a group
   */
  async moveClientToStream(groupId: string, streamId: string) {
    return this.snap.setStream(groupId, streamId)
  }

  /**
   * Mute all clients across all groups
   */
  async muteAllClients() {
    const status = await this.snap.getStatus()

    const clients = status.server.groups.flatMap((g: SnapGroup) => g.clients)

    await Promise.all(
      clients.map((c: SnapClient) =>
        this.snap.setClientVolume({
          id: c.id,
          volume: { percent: c.config.volume.percent, muted: true },
        }),
      ),
    )

    return { count: clients.length }
  }

  /**
   * Unmute all clients across all groups
   */
  async unmuteAllClients() {
    const status = await this.snap.getStatus()

    const clients = status.server.groups.flatMap((g: SnapGroup) => g.clients)

    await Promise.all(
      clients.map((c: SnapClient) =>
        this.snap.setClientVolume({
          id: c.id,
          volume: { percent: c.config.volume.percent, muted: false },
        }),
      ),
    )

    return { count: clients.length }
  }

  /**
   * Set volume percent for ALL clients (preserves mute state)
   */
  async setAllVolume(percent: number) {
    const status = await this.snap.getStatus()

    const clients = status.server.groups.flatMap((g: SnapGroup) => g.clients)

    await Promise.all(
      clients.map((c: SnapClient) =>
        this.snap.setClientVolume({
          id: c.id,
          volume: {
            percent,
            muted: c.config.volume.muted,
          },
        }),
      ),
    )

    return { count: clients.length, percent }
  }
}
