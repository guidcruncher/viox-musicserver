import { existsSync, readFileSync } from "fs"
import { join } from "path"

const candidates = [join(__dirname, "package.json"), join(__dirname, "..", "package.json")]
const pkgPath = candidates.find((p) => existsSync(p)) ?? candidates[0]
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))

export const version: string = pkg.version
