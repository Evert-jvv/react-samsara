import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const rootPath = fileURLToPath(root);
const requiredFiles = [
  "vendor/samsara/dist/samsara.js",
  "vendor/samsara/dist/samsara.css",
  "vendor/samsara/LICENSE",
  "NOTICE.md",
  "README.md",
  "docs/samsara-runtime.md",
  "docs/maintainers.md"
];
const requiredBuiltFiles = [
  "dist/vendor/samsara.js",
  "dist/vendor/samsara.css",
  "dist/samsara.css",
  "dist/styles.css"
];
const requiredPackedFiles = [
  "README.md",
  "NOTICE.md",
  "LICENSE",
  "dist/vendor/samsara.js",
  "dist/vendor/samsara.css",
  "dist/samsara.css",
  "dist/styles.css",
  "docs/samsara-runtime.md",
  "docs/maintainers.md"
];

async function assertFileExists(file) {
  try {
    await access(new URL(file, root));
  } catch {
    throw new Error(`Missing required file: ${file}`);
  }
}

function assertPackageDoesNotDependOnUpstream(packageJson) {
  const dependencyGroups = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];

  for (const group of dependencyGroups) {
    if (packageJson[group]?.samsarajs) {
      throw new Error(`package.json must not list samsarajs in ${group}.`);
    }
  }
}

function assertPackageFiles(packageJson) {
  const files = packageJson.files ?? [];
  for (const requiredEntry of ["dist", "docs", "LICENSE", "NOTICE.md", "README.md"]) {
    if (!files.includes(requiredEntry)) {
      throw new Error(`package.json.files must include ${requiredEntry}.`);
    }
  }
}

function runNpmPackDryRun() {
  const cacheDir = mkdtempSync(join(tmpdir(), "react-samsarajs-npm-cache-"));
  let result;

  try {
    result = spawnSync("npm", ["pack", "--dry-run", "--json"], {
      cwd: rootPath,
      encoding: "utf8",
      env: {
        ...process.env,
        npm_config_cache: cacheDir
      }
    });
  } finally {
    rmSync(cacheDir, { force: true, recursive: true });
  }

  if (result.status !== 0) {
    throw new Error(`npm pack --dry-run failed:\n${result.stderr || result.stdout}`);
  }

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`Could not parse npm pack --dry-run --json output: ${error.message}`);
  }
}

function assertPackedFiles(packuments) {
  const [packument] = packuments;
  const packedFiles = new Set(packument?.files?.map((file) => file.path) ?? []);
  const missing = requiredPackedFiles.filter((file) => !packedFiles.has(file));

  if (missing.length > 0) {
    throw new Error(`npm pack --dry-run is missing required files: ${missing.join(", ")}`);
  }
}

try {
  await Promise.all([...requiredFiles, ...requiredBuiltFiles].map(assertFileExists));

  const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  assertPackageDoesNotDependOnUpstream(packageJson);
  assertPackageFiles(packageJson);
  assertPackedFiles(runNpmPackDryRun());

  console.log("Package independence verification passed.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
