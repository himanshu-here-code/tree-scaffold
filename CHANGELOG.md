# Changelog

## 0.1.0 — 2026-09-24

### Added
- Scrollable plan preview in a side tab (fixes clipped modal for large trees)
- Undo Last Run command with Trash-based deletion
- Starter content for 13 file types (`.html`, `.css`, `.js`, `.ts`, `.swift`, `.md`, …)
- Progress notification during creation
- Per-item error reporting with a "Show Errors" action
- Right-click "Create into This Folder" for Explorer
- Keyboard shortcuts: `⌘⌥T` (selection), `⌘⌥⇧T` (clipboard)

### Changed
- Replaced the confirmation modal's inline detail with a preview tab
- Settings schema documented and typed
- Split extension into focused modules (`parser`, `scaffold`, `templates`, `preview`, `history`, `config`)

### Fixed
- Modal no longer clips when the plan exceeds screen height
- `.xcodeproj` and `.xcassets` correctly treated as folders

## 0.0.1 — 2026-09-24

### Added
- Initial release
- Create from selection / clipboard / file
- Basic tree parsing