// EqualizerService.ts
import { execSync } from "node:child_process"

import { logger } from "@/logger"

import { eqPresetStore } from "./eqPresetStore"
import { equalizerNodeId } from "./equalizerNode"
import { validBands } from "./types"

export class EqualizerService {
  constructor() {}

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
      params[validBands[band.frequency]] = band.gain_db
    }

    this.applyBands(params)
  }

  // ────────────────────────────────────────────────
  // BAND CONTROL
  // ────────────────────────────────────────────────

  setBand(band: string, gainDb: number): void {
    if (!(band in validBands)) {
      logger.warn(`Invalid EQ band requested: ${band}`)
      return
    }
    if (typeof gainDb !== "number" || !Number.isFinite(gainDb)) {
      logger.warn(`Invalid gain value: ${gainDb}`)
      return
    }
    const params: Record<string, number> = {}
    params[validBands[band]] = gainDb
    this.applyBands(params)
  }

  // ────────────────────────────────────────────────
  // READ CURRENT LEVELS
  // ────────────────────────────────────────────────

  getCurrentLevels(): Record<string, number | undefined> {
    const params: Record<string, number | undefined> = {}

    for (const key of Object.keys(validBands)) {
      params[key] = this.getBand(validBands[key])
    }
    return params
  }

  // ────────────────────────────────────────────────
  // INTERNAL HELPERS
  // ────────────────────────────────────────────────

  private executeCommandSync(command: string): string {
    try {
      const stdout = execSync(command, { encoding: "utf-8", stdio: "pipe" }).trim()
      return stdout.trim()
    } catch (error) {
      logger.error(`Command failed: ${command}`, error)
      return ""
    }
  }

  private setBandValue(band: string, gain: number): string {
    const command = `pw-cli set-param ${equalizerNodeId} Props '{params = ["${band}" ${gain}]}'`
    return this.executeCommandSync(command)
  }

  private applyBands(bands: Record<string, number>) {
    for (const key of Object.keys(bands)) {
      this.setBandValue(key, bands[key])
    }
  }

  private getBand(band: string): number | undefined {
    try {
      const stdout = execSync(`pw-dump ${equalizerNodeId}`)
      const dump = JSON.parse(stdout.toString())

      if (!dump[0] || !dump[0].info || !dump[0].info.params || !dump[0].info.params.Props) {
        logger.error(`Error: Dump structure invalid for Node ${equalizerNodeId}.`)
        return undefined
      }
      const propsParam = dump[0].info.params.Props.find(
        (p: any) => p.params && p.params.includes(band),
      )
      if (!propsParam) {
        logger.error(
          `Error: Could not find control '${band}' in 'Props' parameters for Node ${equalizerNodeId}.`,
        )
        return undefined
      }

      const paramsArray = propsParam.params
      const index = paramsArray.indexOf(band)
      const parameterValue = paramsArray[index + 1]
      return parameterValue as number
    } catch (error) {
      logger.error(`Failed to execute pw-dump or parse output for Node ${equalizerNodeId}:`, error)
      return undefined
    }
  }
}
