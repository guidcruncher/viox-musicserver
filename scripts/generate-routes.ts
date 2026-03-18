import { readdirSync, statSync, writeFileSync } from "fs";
import { join, relative, extname, sep } from "path";

const ROUTES_DIR = join(__dirname, "..", "src", "routes");
const OUTPUT_FILE = join(__dirname, "..", "src", "routes.generated.ts");

function collectRoutes(dir: string): string[] {
  console.log(`Scanning ${dir}`);
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const full = join(dir, entry);
    const stats = statSync(full);

    if (stats.isDirectory()) {
      files.push(...collectRoutes(full));
    } else if (stats.isFile()) {
      if (extname(full) == ".ts") {
        files.push(full);
      }
    }
  }

  return files;
}

const routeFiles = collectRoutes(ROUTES_DIR);

let output = `// AUTO-GENERATED FILE — DO NOT EDIT
import { FastifyInstance } from "fastify";

`;

routeFiles.forEach((file, index) => {
  const importPath = "./" + relative(join(__dirname, "..", "src"), file).replace(/\\/g, "/");
  const varName = `route${index}`;
  const importPathWithoutExtension = importPath.slice(0, importPath.lastIndexOf('.'));
  output += `import { ${getExportName(file)} as ${varName} } from "${importPathWithoutExtension}";\n`;
});

output += `

export async function registerAllRoutes(app: FastifyInstance) {
`;

routeFiles.forEach((_, index) => {
  output += `  await app.register(route${index}, {prefix: "/api"});\n`;
});

output += `}\n`;

writeFileSync(OUTPUT_FILE, output);

function getExportName(filePath: string): string {
  const base = filePath.split(sep).pop()!;
  return base.replace(".ts", "").replace(".js", "");
}

console.log("Generated routes.generated.ts");
