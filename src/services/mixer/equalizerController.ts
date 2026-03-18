import { execSync } from "child_process"

import { getLogger } from "../../logger"
import { eqPresetRepository } from "../../repositories/eqPresetRepository"
import { extractEqSettings, type RootObject } from "./parser"

interface Preset {
  [band: string]: number
}

class EqualizerController {
  private readonly nodeDescription: string = "LADSPA Equalizer"

  private readonly validBands: string[] = [
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

  /**
   * Returns all preset names from the database.
   */
  public getAvailablePresetNames(): string[] {
    const presets = eqPresetRepository.findAll()
    return presets.map((p) => p.name)
  }

  /**
   * Applies a named preset from the database.
   */
  public loadPreset(presetName: string): void {
    const nodeId = this.getNodeId()
    const log = getLogger()
    if (!nodeId) return

    const preset = eqPresetRepository.findByNameWithBands(presetName)
    if (!preset) {
      log.error(`[EQ] Preset '${presetName}' not found.`)
      return
    }

    const params: Preset = {}
    for (const band of preset.bands) {
      params[band.frequency] = band.gain_db
    }

    this.sendParams(nodeId, params)
  }

  /**
   * Sets a specific frequency band level.
   */
  public setBand(bandName: string, levelDb: number): void {
    const nodeId = this.getNodeId()
    const log = getLogger()
    if (!nodeId) return

    const targetBand = this.normalizeBandName(bandName)
    if (!targetBand) {
      log.error(`[EQ] Invalid band: ${bandName}`)
      return
    }

    this.sendParams(nodeId, { [targetBand]: levelDb })
  }

  /**
   * Fetches current state by parsing pw-dump output for the specific node.
   */
  public getCurrentLevels(): Record<string, number> {
    const log = getLogger()
    let currentState: Record<string, number> = {}
    this.validBands.forEach((b) => (currentState[b] = 0.0))

    const nodeId = this.getNodeId()
    log.info(`Equalizer Node ID: ${nodeId}`)
    if (!nodeId) return currentState

    try {
      const output = this.execShell(`pw-dump ${nodeId}`)
      const data: RootObject = JSON.parse(output)
      currentState = extractEqSettings(data)
    } catch (e) {
      log.error("[EQ] Failed to parse current levels from pw-dump.", e)
    }
    return currentState
  }

  /**
   * Updates multiple parameters via pw-cli set-param.
   */
  private sendParams(nodeId: number, params: Preset): void {
    const log = getLogger()

    const paramEntries = Object.entries(params)
      .filter(([key]) => this.validBands.includes(key))
      .map(([key, val]) => `"${key}" ${val.toFixed(2)}`)

    if (paramEntries.length === 0) return

    const cmd = `pw-cli set-param ${nodeId} Props '{ params = [ ${paramEntries.join(" ")} ] }'`
    log.info(`Equalizer command: ${cmd}`)
    this.execShell(cmd)
  }

  /**
   * Dynamically finds the Node ID by node.description.
   */
  private getNodeId(): number | null {
    const log = getLogger()
    try {
      const output = this.execShell("pw-dump Node")
      if (!output) return null

      const nodes = JSON.parse(output)
      const target = nodes.find(
        (n: any) => n.info?.props?.["node.description"] === this.nodeDescription,
      )

      return target ? target.id : null
    } catch (e) {
      log.error("[EQ] Error locating Equalizer Node ID.", e)
      return null
    }
  }

  /**
   * Placeholder for Gain control.
   */
  public setGain(value: number): void {
    const nodeId = this.getNodeId()
    const log = getLogger()
    if (!nodeId) return

    const cmd = `pw-cli set-param ${nodeId} Props '{ params = [ "pre_amp:gain" ${value.toFixed(2)} ] }'`
    log.info(`Equalizer Gain command: ${cmd}`)
    this.execShell(cmd)
  }

  // --- Utility Methods ---

  private normalizeBandName(input: string): string | null {
    if (this.validBands.includes(input)) return input
    const clean = input.toLowerCase().replace("hz", "").trim()
    return this.validBands.find((b) => b.toLowerCase().startsWith(clean)) || null
  }

  private execShell(command: string): string {
    const log = getLogger()
    try {
      return execSync(command, { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] }).trim()
    } catch (err) {
      log.error(`[EQ] Shell command failed: ${command}`, err)
      return ""
    }
  }
}

export const equalizerController = new EqualizerController()
