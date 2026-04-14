import { execFile } from "node:child_process"

export interface PwTopRow {
  state: string
  id: number
  quant: number | null
  rate: number | null
  waitUs: number | null
  busyUs: number | null
  wq: number | null
  bq: number | null
  err: number | null
  format: string | null
  name: string
}

export interface PwTopStatus {
  isOutputtingAudio: boolean
  rows: PwTopRow[]
  activeNodes: Array<{
    id: number
    name: string
    busyUs: number
  }>
}

export class PipewireTopService {
  constructor(
    private readonly busyThresholdUs: number = 50, // configurable
  ) {}

  async runPwTop(): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile("pw-top", ["-b", "-n", "2"], { maxBuffer: 5_000_000 }, (err, stdout) => {
        if (err) {
          reject(new Error("Failed to run pw-top: " + err.message))
          return
        }
        resolve(stdout)
      })
    })
  }

  parse(stdout: string): PwTopStatus {
    // Split into batches by header
    const batches = stdout
      .split(/S\s+ID\s+QUANT/)
      .map((s) => s.trim())
      .filter(Boolean)

    // Always take the LAST batch (batch 2)
    const batch = batches[batches.length - 1]
    const lines = batch.split("\n")

    const rows: PwTopRow[] = []
    const activeNodes: PwTopStatus["activeNodes"] = []

    const regex =
      /^\s*([RSICX])\s+(\d+)\s+(\d+|-+)\s+(\d+|-+)\s+([\d.]+)us\s+([\d.]+)us\s+([\d.]+|-+)\s+([\d.]+|-+)\s+(\d+)\s+(.*?)\s*\+\s*(.+)$/

    for (const line of lines) {
      if (!line.trim()) continue

      const m = line.match(regex)
      if (!m) continue

      const [
        ,
        state,
        idStr,
        quantStr,
        rateStr,
        waitStr,
        busyStr,
        wqStr,
        bqStr,
        errStr,
        format,
        name,
      ] = m

      const id = Number(idStr)
      const quant = quantStr === "---" ? null : Number(quantStr)
      const rate = rateStr === "---" ? null : Number(rateStr)
      const waitUs = Number(waitStr)
      const busyUs = Number(busyStr)
      const wq = wqStr === "---" ? null : Number(wqStr)
      const bq = bqStr === "---" ? null : Number(bqStr)
      const err = Number(errStr)

      rows.push({
        state,
        id,
        quant,
        rate,
        waitUs,
        busyUs,
        wq,
        bq,
        err,
        format: format.trim() || null,
        name: name.trim(),
      })

      if (busyUs > this.busyThresholdUs) {
        activeNodes.push({ id, name: name.trim(), busyUs })
      }
    }

    return {
      isOutputtingAudio: activeNodes.length > 0,
      rows,
      activeNodes,
    }
  }

  async getStatus(): Promise<PwTopStatus> {
    const stdout = await this.runPwTop()
    return this.parse(stdout)
  }
}
