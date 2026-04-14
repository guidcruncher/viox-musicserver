// PipewireReverbService.ts
import { execSync } from "node:child_process"

import * as fs from "fs"

import { logger } from "@/logger"

import { getNodeIdByName } from "./equalizerNode"

export class PipewireReverbService {
  private readonly nodeName = "convolver"
  private readonly controlParamId = 16 // SPA_PARAM_Route

  private readonly GAIN_INDEX = 0
  private readonly DELAY_INDEX = 1

  private readonly nodeId: string | null

  constructor() {
    this.nodeId = getNodeIdByName(this.nodeName)
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

  private formatSpaControl(index: number, value: number): string {
    const control = {
      index,
      id: index,
      type: "float",
      value,
    }

    // PipeWire SPA JSON cannot contain quotes
    return `'${JSON.stringify(control).replace(/"/g, "")}'`
  }

  private applyControl(index: number, value: number): void {
    if (!this.nodeId) {
      logger.error("Convolver node not found.")
      return
    }

    const spa = this.formatSpaControl(index, value)
    const cmd = `pw-cli s ${this.nodeId} ${this.controlParamId} ${spa}`

    this.executeCommandSync(cmd)
  }

  // ────────────────────────────────────────────────
  // PUBLIC CONTROL METHODS
  // ────────────────────────────────────────────────

  setGain(gain: number): void {
    this.applyControl(this.GAIN_INDEX, gain)
  }

  setDelay(delay: number): void {
    this.applyControl(this.DELAY_INDEX, delay)
  }

  // ────────────────────────────────────────────────
  // IR FILE CONTROL (NO SHELL SCRIPT)
  // ────────────────────────────────────────────────

  public changeIR(filename: string, gain: number, delay: number): void {
    if (!this.nodeId) {
      logger.error("Convolver node not found.")
      return
    }

    // Validate numeric inputs to prevent command injection
    if (typeof gain !== "number" || !Number.isFinite(gain)) {
      logger.error(`Invalid gain value: ${gain}`)
      return
    }
    if (typeof delay !== "number" || !Number.isFinite(delay)) {
      logger.error(`Invalid delay value: ${delay}`)
      return
    }

    // Sanitize filename: only allow alphanumeric, hyphens, underscores, dots
    if (!/^[\w.-]+$/.test(filename)) {
      logger.error(`Invalid IR filename: ${filename}`)
      return
    }

    const irPath = `${process.env.IR_RESPONSE_BASE}/${filename}`

    if (!fs.existsSync(irPath)) {
      logger.error(`IR file does not exist: ${irPath}`)
      return
    }

    const param = `
      {
        ir.filename = "${irPath}",
        ir.gain = ${gain},
        ir.delay = ${delay}
      }
    `.replace(/\s+/g, " ")

    const cmd = `pw-cli set-param ${this.nodeId} Props '${param}'`

    logger.info(`Applying IR: ${irPath}`)
    const result = this.executeCommandSync(cmd)

    if (result === "") {
      logger.error("Failed to apply IR parameters.")
    } else {
      logger.info(`IR applied successfully: ${irPath}`)
    }
  }

  enableFilter(filename: string): void {
    this.changeIR(filename, 0.95, 0)
  }

  disableFilter(): void {
    this.changeIR("bypass.wav", 1, 0)
  }

  // ────────────────────────────────────────────────
  // PRESET LISTING
  // ────────────────────────────────────────────────

  getConvolverPresets(): any {
    const path = `${process.env.IR_RESPONSE_BASE}/00-index.json`

    try {
      const json = fs.readFileSync(path, "utf8")
      return JSON.parse(json)
    } catch (error) {
      logger.error("Failed to load convolver preset index", error)
      return []
    }
  }
}
