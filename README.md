<div align="center">

# Tree Scaffold

**Turn any ASCII tree into real folders and files — in one command.**

[![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.85.0-007ACC?logo=visualstudiocode&logoColor=white)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](CHANGELOG.md)

Paste a tree. Get a project. No more clicking "New Folder" forty times.

</div>

---

## The problem

You sketch out a project structure — in a README, a chat message, a design doc, a
comment in your code:

```
my-app/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   └── index.js
└── package.json
```

Then you have to build it by hand. One folder at a time. One file at a time.
It's tedious, error-prone, and it kills momentum before you've written a single
line of real code.

**Tree Scaffold closes that gap.**

---

## What it does

- Reads ASCII / Unicode trees from **selection**, **clipboard**, or a **file**
- Shows a **scrollable preview** of every file and folder it will create
- Creates the whole structure in one shot — with a **progress bar**
- Fills new files with **sensible starter content** (`.html`, `.css`, `.js`, `.swift`, `.md`, …)
- Lets you **undo the whole thing** with one click
- Works on **any tree format** you've already seen in the wild

---

## Install

**From a `.vsix` file** — grab the latest from the [Releases page](https://github.com/himanshu-here-code/tree-scaffold/releases/latest):

```bash
code --install-extension tree-scaffold-0.1.0.vsix
```

Or via the UI: **Extensions panel → ⋯ → Install from VSIX…**

**From the Marketplace** *(coming soon)*

Search for **"Tree Scaffold"** in the Extensions panel, or:

```
ext install himanshu-tools.tree-scaffold
```

---

## Quick start

1. **Open a folder** in VS Code — this is where the tree will be created.
2. **Paste a tree** into any file (or copy it to your clipboard).
3. **Select it** and press **⌘⌥T** *(Mac)* / **Ctrl+Alt+T** *(Windows/Linux)*.
4. **Review the plan** in the side tab that opens.
5. Click **Create**.

That's it. Your folders and files appear in the Explorer.

---

## Usage

### From a selection

Select any block of tree text in an editor, then:

- Press **⌘⌥T** / **Ctrl+Alt+T**
- Or right-click → **Tree Scaffold: Create from Selection**
- Or Command Palette → `Tree Scaffold: Create from Selection`

### From the clipboard

Copy a tree anywhere — a website, a chat, a doc — then:

- Press **⌘⌥⇧T** / **Ctrl+Alt+Shift+T**
- Or Command Palette → `Tree Scaffold: Create from Clipboard`

### From a file

Have a `.tree` file checked into your repo? Run:

- Command Palette → `Tree Scaffold: Create from File…`

Pick the file. Done.

### Into a specific folder

Right-click any folder in the Explorer sidebar:

- **Tree Scaffold: Create into This Folder (from Clipboard)**

The tree is built inside that folder. No need to change your workspace root.

### Undo

Every successful run records what it created. To reverse it:

- Click **Undo** on the success notification
- Or Command Palette → `Tree Scaffold: Undo Last Run`

Items go to Trash, not permanent deletion.

---

## Commands

| Command | Default binding | Where |
|---|---|---|
| `Tree Scaffold: Create from Selection` | `⌘⌥T` / `Ctrl+Alt+T` | Editor, palette, right-click |
| `Tree Scaffold: Create from Clipboard` | `⌘⌥⇧T` / `Ctrl+Alt+Shift+T` | Palette |
| `Tree Scaffold: Create from File…` | — | Palette, Explorer right-click |
| `Tree Scaffold: Create into This Folder (from Clipboard)` | — | Explorer right-click |
| `Tree Scaffold: Undo Last Run` | — | Palette, toast button |

All bindings are rebindable in **Keyboard Shortcuts** (`⌘K ⌘S`).

---

## Settings

| Setting | Default | Description |
|---|---|---|
| `treeScaffold.targetFolder` | `""` | Absolute path for the tree. Empty = workspace root. |
| `treeScaffold.overwrite` | `false` | Overwrite existing files instead of skipping. |
| `treeScaffold.useTemplates` | `true` | Write starter content into known file types. |
| `treeScaffold.customFileContent` | `""` | If set, every file gets this exact content. Overrides templates. |
| `treeScaffold.confirmBeforeCreate` | `true` | Show a confirmation dialog before writing. |

---

## Starter templates

When `treeScaffold.useTemplates` is `true` (default), new files get real content:

| Extension | Content |
|---|---|
| `.html` | Full HTML5 boilerplate with `<title>` set to the filename |
| `.css` | `/* filename */` |
| `.scss` / `.sass` | `// filename` |
| `.js` | `'use strict';` |
| `.ts` | `export {};` |
| `.jsx` / `.tsx` | React component with the filename in PascalCase |
| `.swift` | `import Foundation` |
| `.md` | `# Title` from filename |
| `.json` | `{}` |
| `.yml` / `.yaml` | `# filename` comment |
| `.sh` | `#!/usr/bin/env bash` + `set -euo pipefail` |
| `.py` | Docstring with filename |
| `.go` | `package` declaration |

Everything else gets an empty file.

---

## Supported tree formats

Tree Scaffold handles all the common Unicode and ASCII variants you'll see in
READMEs, GitHub issues, terminal output, and chat messages.

**Unicode box-drawing**

```
project/
├── src/
│   ├── main.js
│   └── utils/
│       └── helpers.js
└── README.md
```

**Classic `tree` command output** — same as above, works out of the box.

**Trailing slashes for folders** — optional but respected:

```
project/
├── src/
│   └── main.js
└── docs/
```

**Dotfiles** — correctly detected as files, not folders:

```
project/
├── .gitignore
├── .editorconfig
└── src/
```

**Special folder types** — `.xcodeproj`, `.xcassets`, `.app`, `.framework`,
`.bundle`, `.lproj` are treated as **folders** even though they have extensions.

---

## How it works

1. **Parse** — a line-by-line regex walks the tree, computes depth from
   indentation and branch markers (`├──`, `└──`, `│`), and classifies each
   entry as file or folder.
2. **Plan** — the parsed entries are compared against the filesystem to build a
   list of `create` / `skip` / `overwrite` actions. Nothing is written yet.
3. **Preview** — the plan opens in a side tab so you can scroll, search, and
   sanity-check before committing.
4. **Apply** — with your confirmation, folders and files are created with a
   progress bar. Errors are captured per-item, not swallowed.
5. **Remember** — everything that was created is recorded so **Undo** can
   cleanly reverse it.

The whole pipeline is idempotent. Run it twice — the second run creates nothing
and reports everything as skipped.

---

## Examples

### A web project

```
portfolio/
├── .gitignore
├── index.html
├── about.html
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   └── reset.css
│   ├── js/
│   │   └── app.js
│   └── images/
└── pages/
    └── blog/
        └── post-1.html
```

Select it → ⌘⌥T → Create. The whole tree plus HTML boilerplate in every page.

### A Swift package

```
Nova/
├── Nova.xcodeproj
├── Nova/
│   ├── App/
│   │   ├── NovaApp.swift
│   │   └── AppDelegate.swift
│   ├── Voice/
│   │   ├── AudioCapture.swift
│   │   └── Transcribing.swift
│   └── Resources/
│       ├── Assets.xcassets
│       └── Nova.entitlements
└── NovaTests/
    └── NovaAppTests.swift
```

`Nova.xcodeproj` and `Assets.xcassets` are correctly created as folders.

### A backend service

```
api/
├── src/
│   ├── routes/
│   │   ├── users.ts
│   │   └── auth.ts
│   ├── models/
│   │   └── User.ts
│   └── index.ts
├── tests/
│   └── users.test.ts
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Tips

- **Big tree?** The preview tab is scrollable and searchable (⌘F). Review before
  creating.
- **Wrong target?** Set `treeScaffold.targetFolder` to an absolute path, or
  right-click the folder you want in the Explorer.
- **Existing files?** By default they're **skipped**, not overwritten. Turn on
  `treeScaffold.overwrite` if you want to force-replace.
- **Undo failed?** Some items may be locked by another process (open editors,
  running servers). Close them and try again.
- **Custom boilerplate?** Set `treeScaffold.customFileContent` — every file gets
  the exact same content.

---

## Roadmap

- [ ] `.treeignore` — skip paths by glob pattern
- [ ] Multi-root workspace support
- [ ] Reverse mode: folder → tree text
- [ ] Diff mode against an existing tree
- [ ] Per-extension template overrides via settings
- [ ] Command-line version (`npx tree-scaffold tree.txt`)

Vote for what you want next in the
[Discussions](https://github.com/himanshu-here-code/tree-scaffold/discussions) tab.

---

## Contributing

Issues and PRs welcome.

```bash
git clone https://github.com/himanshu-here-code/tree-scaffold
cd tree-scaffold
npm install
npm run compile
```

Press **F5** to launch the Extension Development Host.

---

## License

[MIT](LICENSE) © Himanshu