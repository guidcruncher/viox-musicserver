import { execSync } from "node:child_process"

import { logger } from "@/logger"

const executeCommandSync = (command: string): string => {
  try {
    const stdout = execSync(command, { encoding: "utf-8", stdio: "pipe" }).trim()
    return stdout.trim()
  } catch {
    return ""
  }
}

export const getNodeIdByName = (name: string): string | null => {
  const jsonOutput = executeCommandSync("pw-dump -N")
  try {
    const graph = JSON.parse(jsonOutput)
    const targetNode = graph.find((obj: any) => {
      return obj.type === "PipeWire:Interface:Node" && obj.info.props?.["media.name"] === name
    })
    logger.debug(`Pipewire nodeid for "${name}" = ${targetNode ? String(targetNode.id) : null}`)
    return targetNode ? String(targetNode.id) : null
  } catch {
    return null
  }
}

export const equalizerNodeId = getNodeIdByName("eq-sink")
