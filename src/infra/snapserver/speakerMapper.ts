type SnapserverJson = {
  server: {
    groups: Array<{
      clients: Array<{
        id: string
        connected: boolean
        config: {
          name: string
          volume: {
            percent: number
            muted: boolean
          }
        }
        host: {
          ip: string
        }
      }>
    }>
  }
}

type FlatClient = {
  id: string
  name: string
  ip: string
  volumePercent: number
  muted: boolean
  connected: boolean
}

export function flattenClients(data: SnapserverJson): FlatClient[] {
  const flat = data.server.groups.flatMap((group) =>
    group.clients.map((client) => ({
      id: client.id,
      name: client.config.name,
      ip: client.host.ip,
      volumePercent: client.config.volume.percent,
      muted: client.config.volume.muted,
      connected: client.connected,
    })),
  )

  return flat.sort((a, b) => a.name.localeCompare(b.name))
}
