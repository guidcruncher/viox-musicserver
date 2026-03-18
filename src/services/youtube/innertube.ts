import fs from "node:fs/promises"

import { Innertube, Platform, Types, UniversalCache } from "youtubei.js"

import { getConfig } from "@/config"

export const clientType = "TV"

/**
 * Preserve your existing decipher shim.
 */
Platform.shim.eval = async (
  data: Types.BuildScriptResult,
  env: Record<string, Types.VMPrimative>,
) => {
  const properties = []

  if (env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n}")`)
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`)
  }

  const code = `${data.output}\nreturn { ${properties.join(", ")} }`

  return new Function(code)()
}

/**
 * Load cached OAuth credentials from getConfig("youtubeCreds").
 */
async function loadCredentials() {
  try {
    const raw = await fs.readFile(getConfig("youtubeCreds"), "utf8")
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Persist updated credentials whenever YouTube refreshes tokens.
 */
async function saveCredentials(creds: any) {
  await fs.writeFile(getConfig("youtubeCreds"), JSON.stringify(creds, null, 2), "utf8")
}

let client: Innertube | null = null

export const getInnertube = async (): Promise<Innertube> => {
  if (client) return client

  const token = await loadCredentials()

  if (token) {
    // Spread token fields directly — web build requires this
    client = await Innertube.create({
      cache: new UniversalCache(false),
      ...token,
    })

    client.session.on("update-credentials", async ({ credentials }) => {
      await saveCredentials(credentials)
    })

    return client
  }

  // Anonymous fallback
  client = await Innertube.create({
    cache: new UniversalCache(false),
  })

  return client
}
