import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Ein enger Compilerlauf vermeidet OS-Profilzugriffe des tsx-Launchers in
// eingeschränkten Windows-Umgebungen. Die Quell-Pipeline bleibt TypeScript.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ausgabe = ".cache/pipeline-runtime";
const build = spawnSync(process.execPath, [
  resolve(root, "node_modules/typescript/bin/tsc"), "pipeline/run.ts",
  "--outDir", ausgabe, "--rootDir", ".", "--target", "es2022",
  "--module", "commonjs", "--moduleResolution", "node", "--esModuleInterop",
  "--skipLibCheck", "--strict", "--noUncheckedIndexedAccess",
], { cwd: root, stdio: "inherit" });
if (build.status !== 0) process.exit(build.status ?? 1);
const run = spawnSync(process.execPath, [resolve(root, ausgabe, "pipeline/run.js")], { cwd: root, stdio: "inherit", env: process.env });
process.exit(run.status ?? 1);
