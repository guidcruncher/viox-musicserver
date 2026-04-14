import dns from "dns"
import util from "util"

export class RadioBrowserDnsResolver {
  private resolveSrv = util.promisify(dns.resolveSrv)

  /**
   * Resolve all RadioBrowser API servers via DNS SRV.
   * Returns a shuffled list of base URLs.
   */
  async resolveServers(): Promise<string[]> {
    try {
      const records = await this.resolveSrv("_api._tcp.radio-browser.info")

      if (!records || records.length === 0) {
        return []
      }

      // Convert SRV records → https://hostname
      const hosts = records.map((r) => `https://${r.name}`).sort(() => Math.random() - 0.5) // shuffle

      return hosts
    } catch {
      return []
    }
  }

  /**
   * Returns a single random server URL.
   * Falls back to a known stable mirror if DNS fails.
   */
  async pickServer(): Promise<string> {
    const servers = await this.resolveServers()

    if (servers.length > 0) {
      return servers[Math.floor(Math.random() * servers.length)]
    }

    // Fallback: stable public mirror
    return "https://de1.api.radio-browser.info"
  }
}
