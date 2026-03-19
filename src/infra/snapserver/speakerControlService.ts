import { SnapserverOrchestrator } from "./snapServerOrchestrator"

export interface SpeakerStatus {
  id: string
  name: string
  ip: string
  volumePercent: number
  muted: boolean
  connected: boolean
}

export class SpeakerControlService {
  constructor(private snap = new SnapserverOrchestrator()) {}

  // ────────────────────────────────────────────────
  // GETTERS
  // ────────────────────────────────────────────────

  async getAllSpeakers(): Promise<SpeakerStatus[]> {
    const flat = await this.snap.getSpeakers()
    return flat.map((c: any) => ({
      id: c.id,
      name: c.name,
      ip: c.ip,
      volumePercent: c.volumePercent,
      muted: c.muted,
      connected: c.connected,
    }))
  }

  async getSpeaker(id: string): Promise<SpeakerStatus | undefined> {
    const all = await this.getAllSpeakers()
    return all.find((s) => s.id === id)
  }

  // ────────────────────────────────────────────────
  // VOLUME CONTROL
  // ────────────────────────────────────────────────

  async setVolume(id: string, percent: number): Promise<void> {
    const speaker = await this.getSpeaker(id)
    if (!speaker) throw new Error(`Speaker ${id} not found`)

    await this.snap.setVolume(id, percent, speaker.muted)
  }

  async setVolumeAll(percent: number): Promise<void> {
    await this.snap.setAllVolume(percent)
  }

  // ────────────────────────────────────────────────
  // MUTE CONTROL
  // ────────────────────────────────────────────────

  async mute(id: string): Promise<void> {
    const speaker = await this.getSpeaker(id)
    if (!speaker) throw new Error(`Speaker ${id} not found`)

    await this.snap.setVolume(id, speaker.volumePercent, true)
  }

  async unmute(id: string): Promise<void> {
    const speaker = await this.getSpeaker(id)
    if (!speaker) throw new Error(`Speaker ${id} not found`)

    await this.snap.setVolume(id, speaker.volumePercent, false)
  }

  async muteAll(): Promise<void> {
    await this.snap.muteAllClients()
  }

  async unmuteAll(): Promise<void> {
    await this.snap.unmuteAllClients()
  }

  // ────────────────────────────────────────────────
  // COMBINED CONTROL
  // ────────────────────────────────────────────────

  async setVolumeAndMute(id: string, percent: number, muted: boolean): Promise<void> {
    await this.snap.setVolume(id, percent, muted)
  }

  async setVolumeAndMuteAll(percent: number, muted: boolean): Promise<void> {
    const speakers = await this.getAllSpeakers()
    await Promise.all(speakers.map((s) => this.snap.setVolume(s.id, percent, muted)))
  }
}
