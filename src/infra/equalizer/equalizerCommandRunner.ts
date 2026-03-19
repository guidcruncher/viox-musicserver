// EqualizerCommandRunner.ts
import { execSync } from "child_process"

export class EqualizerCommandRunner {
  run(cmd: string): string {
    try {
      return execSync(cmd, {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      }).trim()
    } catch {
      return ""
    }
  }
}
