import fs from "node:fs"

import { logger } from "@/logger"

import type { ConfigFile } from "./types"

export const saveConfig = (cfg: ConfigFile): ConfigFile | undefined => {
  try {
    const filePath = "/config/viox-musicserver-config.json"
    logger.debug(`Saving config to ${filePath}`)
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, filePath + ".bak")
    }
    const raw = JSON.stringify(cfg, null, 2)
    fs.writeFileSync(filePath, raw, "utf8")
    return cfg
  } catch (err) {
    logger.error("Error saving config", err)
    return undefined
  }
}

export const readFileConfig = (): ConfigFile | undefined => {
  try {
    const filePath = "/config/viox-musicserver-config.json"
    logger.debug(`Checking config at ${filePath}`)
    if (fs.existsSync(filePath)) {
      logger.debug(`Reading config from  ${filePath}`)
      const json = fs.readFileSync(filePath, "utf8").trim()
      logger.debug(`Config : ${json}`)
      return JSON.parse(json) as ConfigFile
    }

    logger.error(`Config file not found ${filePath}`)
    return undefined
  } catch (err) {
    logger.error("Error Reading  config", err)
    return undefined
  }
}

export const readSecret = <T>(secretPath: string): T | undefined => {
  try {
    return fs.readFileSync(`/run/secrets/${secretPath}`, "utf8").trim() as T
  } catch {
    return undefined
  }
}
