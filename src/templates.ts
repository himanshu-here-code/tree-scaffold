export function defaultContentFor(filename: string): string {
  const ext = extOf(filename);
  const base = baseOf(filename);

  switch (ext) {
    case "html":
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${base}</title>
</head>
<body>

</body>
</html>
`;

    case "css":
      return `/* ${filename} */

`;

    case "scss":
    case "sass":
      return `// ${filename}

`;

    case "js":
      return `'use strict';

`;

    case "ts":
      return `export {};

`;

    case "jsx":
      return `import React from "react";

export default function ${pascal(base)}() {
  return null;
}
`;

    case "tsx":
      return `import React from "react";

export default function ${pascal(base)}() {
  return null;
}
`;

    case "swift":
      return `import Foundation

`;

    case "md":
      return `# ${base}

`;

    case "json":
      return `{
}
`;

    case "yml":
    case "yaml":
      return `# ${filename}

`;

    case "sh":
      return `#!/usr/bin/env bash
set -euo pipefail

`;

    case "py":
      return `"""${filename}"""

`;

    case "go":
      return `package ${base.toLowerCase().replace(/[^a-z0-9]/g, "")}

`;

    default:
      return "";
  }
}

function extOf(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i < 0 ? "" : filename.slice(i + 1).toLowerCase();
}

function baseOf(filename: string): string {
  const last = filename.split("/").pop() ?? filename;
  const i = last.lastIndexOf(".");
  return i < 0 ? last : last.slice(0, i);
}

function pascal(s: string): string {
  return s
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("");
}