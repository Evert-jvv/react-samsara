import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = new URL("../", import.meta.url);
const scannedRoots = ["README.md", "docs"];
const allowedHeadings = [
  "vendored upstream",
  "vendored samsarajs",
  "licensing and attribution",
  "provenance",
  "attribution"
];
const blockedPatterns = [
  {
    label: "upstream Samsara website",
    pattern: /samsarajs\.org/i
  },
  {
    label: "upstream Samsara source repository",
    pattern: /github\.com\/dmvaldman\/samsara/i
  },
  {
    label: "installing the upstream samsarajs package",
    pattern: /npm\s+install\s+samsarajs/i
  }
];

async function listMarkdownFiles(entry) {
  const absolutePath = path.resolve(root.pathname, entry);
  const stats = await readdirOrNull(absolutePath);

  if (!stats) {
    return [entry].filter((file) => file.endsWith(".md"));
  }

  const files = [];
  for (const child of stats) {
    const relativePath = path.join(entry, child.name);

    if (child.isDirectory()) {
      if (relativePath === path.join("docs", "prd")) {
        continue;
      }

      files.push(...(await listMarkdownFiles(relativePath)));
    } else if (child.isFile() && child.name.endsWith(".md")) {
      files.push(relativePath);
    }
  }

  return files;
}

async function readdirOrNull(absolutePath) {
  try {
    return await readdir(absolutePath, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOTDIR") {
      return null;
    }

    throw error;
  }
}

function sectionAllowsUpstreamReferences(heading) {
  const normalized = heading.toLowerCase();
  return allowedHeadings.some((allowedHeading) => normalized.includes(allowedHeading));
}

async function scanFile(file) {
  const text = await readFile(new URL(file, root), "utf8");
  const failures = [];
  let currentHeading = "";

  text.split(/\r?\n/).forEach((line, index) => {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      currentHeading = heading[2];
    }

    if (sectionAllowsUpstreamReferences(currentHeading)) {
      return;
    }

    for (const blockedPattern of blockedPatterns) {
      if (blockedPattern.pattern.test(line)) {
        failures.push({
          file,
          line: index + 1,
          label: blockedPattern.label,
          text: line.trim()
        });
      }
    }
  });

  return failures;
}

const files = (await Promise.all(scannedRoots.map(listMarkdownFiles))).flat().sort();
const failures = (await Promise.all(files.map(scanFile))).flat();

if (failures.length > 0) {
  console.error("Found upstream dependency instructions outside attribution/provenance sections:");
  for (const failure of failures) {
    console.error(`- ${failure.file}:${failure.line}: ${failure.label}: ${failure.text}`);
  }
  process.exit(1);
}

console.log(`Checked ${files.length} documentation files for upstream dependency links.`);
