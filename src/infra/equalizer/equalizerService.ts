// EqualizerService.ts
import { eqPresetStore } from "./eqPresetStore"
import { EqualizerCommandRunner } from "./equalizerCommandRunner"
import { EqualizerNodeResolver } from "./equalizerNodeResolver"
import { EqualizerParamParser } from "./equalizerParamParser"

export class EqualizerService {
  private readonly validBands = [
    "31 Hz",
    "63 Hz",
    "125 Hz",
    "250 Hz",
    "500 Hz",
    "1 kHz",
    "2 kHz",
    "4 kHz",
    "8 kHz",
    "16 kHz",
  ]

  constructor(
    private resolver = new EqualizerNodeResolver(),
    private parser = new EqualizerParamParser(),
    private runner = new EqualizerCommandRunner(),
  ) {}

  // ────────────────────────────────────────────────
  // PRESETS
  // ────────────────────────────────────────────────

  getAvailablePresets(): string[] {
    return eqPresetStore.getAll().map((p: any) => p.name)
  }

  loadPreset(name: string): void {
    const preset = eqPresetStore.getByNameWithBands(name)
    if (!preset) return

    const params: Record<string, number> = {}
    for (const band of preset.bands) {
      params[band.frequency] = band.gain_db
    }

    this.applyParams(params)
  }

  // ────────────────────────────────────────────────
  // BAND CONTROL
  // ────────────────────────────────────────────────

  setBand(band: string, gainDb: number): void {
    const normalized = this.normalizeBand(band)
    if (!normalized) return

    this.applyParams({ [normalized]: gainDb })
  }

  setGain(gainDb: number): void {
    const nodeId = this.resolver.getNodeId()
    if (!nodeId) return

    const cmd = `pw-cli set-param ${nodeId} Props '{ params = [ "pre_amp:gain" ${gainDb.toFixed(
      2,
    )} ] }'`

    this.runner.run(cmd)
  }

  // ────────────────────────────────────────────────
  // READ CURRENT LEVELS
  // ────────────────────────────────────────────────

  getCurrentLevels(): Record<string, number> {
    const nodeId = this.resolver.getNodeId()
    if (!nodeId) return {}

    const output = this.runner.run(`pw-dump ${nodeId}`)
    if (!output) return {}

    const json = JSON.parse(output)
    return this.parser.parseLevels(json)
  }

  // ────────────────────────────────────────────────
  // INTERNAL HELPERS
  // ────────────────────────────────────────────────

  private applyParams(params: Record<string, number>): void {
    const nodeId = this.resolver.getNodeId()
    if (!nodeId) return

    const entries = Object.entries(params)
      .filter(([k]) => this.validBands.includes(k))
      .map(([k, v]) => `"${k}" ${v.toFixed(2)}`)

    if (entries.length === 0) return

    const cmd = `pw-cli set-param ${nodeId} Props '{ params = [ ${entries.join(" ")} ] }'`
    this.runner.run(cmd)
  }

  private normalizeBand(input: string): string | null {
    if (this.validBands.includes(input)) return input

    const clean = input.toLowerCase().replace("hz", "").trim()
    return this.validBands.find((b) => b.toLowerCase().startsWith(clean)) || null
  }
}

export const equalizerService = new EqualizerService()
