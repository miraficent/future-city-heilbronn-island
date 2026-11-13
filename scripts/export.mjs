import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ergebnis = spawnSync(process.execPath, [resolve(root, "node_modules/next/dist/bin/next"), "build"], { cwd: root, stdio: "inherit", env: { ...process.env, COSMOS_STATIC_EXPORT: "1" } });
process.exit(ergebnis.status ?? 1);
