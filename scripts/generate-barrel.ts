#!/usr/bin/env ts-node

import fs from "fs";
import path from "path";

interface ScanOptions {
  recursive?: boolean;
  ignoreIndex?: boolean;
}

function scanForTSFiles(dir: string, options: ScanOptions = {}): string[] {
  const { recursive = true, ignoreIndex = true } = options;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && recursive) {
      files.push(...scanForTSFiles(fullPath, options));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".ts")) {
      // Exclude index.ts
      if (ignoreIndex && entry.name === "index.ts") continue;

      // Exclude .d.ts files
      if (entry.name.endsWith(".d.ts")) continue;

      files.push(fullPath);
    }
  }

  return files;
}

function toExportPath(baseDir: string, filePath: string): string {
  const rel = path.relative(baseDir, filePath);
  const noExt = rel.replace(/\.ts$/, "");
  return "./" + noExt.replace(/\\/g, "/");
}

function generateBarrelForDir(dir: string) {
  const absDir = path.resolve(dir);

  if (!fs.existsSync(absDir)) {
    console.error(`Directory not found: ${absDir}`);
    return;
  }

  const tsFiles = scanForTSFiles(absDir, {
    recursive: true,
    ignoreIndex: true,
  });

  const exportLines = tsFiles
    .map((file) => `export * from "${toExportPath(absDir, file)}";`)
    .sort();

  const indexPath = path.join(absDir, "index.ts");

  const header = `// AUTO-GENERATED FILE — DO NOT EDIT\n\n`;
  const content = header + exportLines.join("\n") + "\n";

  fs.writeFileSync(indexPath, content, "utf8");

  console.log(`Generated barrel for: ${absDir}`);
  exportLines.forEach((l) => console.log("  " + l));
}


function run() {
  const dirs = ["./src/schemas", "./src/types"]

  dirs.forEach(generateBarrelForDir);
}

run();