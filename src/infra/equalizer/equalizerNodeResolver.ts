// EqualizerNodeResolver.ts
import { execSync } from "child_process"

export class EqualizerNodeResolver {
  constructor(private description = "LADSPA Equalizer") {}

  getNodeId(): number | null {
    try {
      const output = execSync("pw-dump Node", {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      })

      const nodes = JSON.parse(output)
      const target = nodes.find(
        (n: any) => n.info?.props?.["node.description"] === this.description,
      )

      return target ? target.id : null
    } catch {
      return null
    }
  }
}
