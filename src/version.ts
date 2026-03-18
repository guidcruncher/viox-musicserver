import { readFileSync } from "fs"
import { join } from "path"

const pkgPath = join(__dirname, "package.json")
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))

export const version: string = pkg.version
