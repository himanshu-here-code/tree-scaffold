export interface TreeEntry {
  /** Depth (0 = root name given on first line, 1 = direct child, etc.) */
  depth: number;
  name: string;
  /** true if the line ends with a trailing slash or has no extension */
  isDir: boolean;
}

/**
 * Parse an ASCII / Unicode tree (├──, └──, │, indentation).
 * Returns entries in file-order, each with a depth.
 * The first non-empty line with no branch glyph is treated as the root (depth 0).
 */
export function parseTree(input: string): TreeEntry[] {
  const entries: TreeEntry[] = [];
  const lines = input.replace(/\r\n?/g, "\n").split("\n");

  // Regex: leading (indent * branch) + name
  // - prefix: groups of 4 chars made of '│   ' or '    '
  // - branch: '├── ' or '└── ' (optionally with '─' instead of '──')
  const lineRe = /^((?:[│ ]   )*)([├└`]─+ |[├└`]-+ )?(.+?)\s*$/;

  for (const raw of lines) {
    if (!raw.trim()) continue;
    if (/^\s*#/.test(raw)) continue; // allow comments

    const m = lineRe.exec(raw);
    if (!m) continue;

    const prefix = m[1] ?? "";
    const branch = m[2] ?? undefined;
    const name = (m[3] ?? "").trim();

    if (!name) continue;

    // Compute depth
    let depth: number;
    if (branch) {
      // Each 4-char indent block = 1 level; the branch marker = 1 more
      depth = Math.floor(prefix.length / 4) + 1;
    } else {
      // Root line (no branch glyph)
      depth = 0;
    }

    const isDir = detectDir(name);
    entries.push({ depth, name: stripTrailingSlash(name), isDir });
  }

  return entries;
}

function stripTrailingSlash(name: string): string {
  return name.endsWith("/") ? name.slice(0, -1) : name;
}

/**
 * Heuristics for "this is a folder":
 *  - ends with '/'
 *  - no '.' in the last path segment (except common dotfiles)
 *  - OR the name matches a known project folder hint
 */
function detectDir(name: string): boolean {
  if (name.endsWith("/")) return true;

  const last = name.split("/").pop() ?? name;

  // Dotfiles like .gitignore, .env are files
  if (/^\.[A-Za-z0-9_-]+$/.test(last) && !/\.[A-Za-z0-9]+$/.test(last.slice(1))) {
    return false;
  }

  // Has an extension → file
  if (/\.[A-Za-z0-9_+-]+$/.test(last)) return false;

  // "Something.xcodeproj" is a folder but ends in extension — special case
  if (/\.xcodeproj$|\.xcassets$|\.app$|\.framework$|\.bundle$|\.lproj$/.test(last)) {
    return true;
  }

  // Otherwise treat as directory (this matches your Nova tree where
  // folders have no extension)
  return true;
}