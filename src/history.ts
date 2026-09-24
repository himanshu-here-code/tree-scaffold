import * as vscode from "vscode";
import * as path from "path";

const KEY = "treeScaffold.lastRun";

export interface RunRecord {
  root: string;
  createdPaths: string[];
  at: number;
}

let ctx: vscode.ExtensionContext | undefined;

export function initHistory(context: vscode.ExtensionContext) {
  ctx = context;
}

export async function recordRun(rec: RunRecord): Promise<void> {
  if (!ctx) return;
  await ctx.workspaceState.update(KEY, rec);
}

export function getLastRun(): RunRecord | undefined {
  return ctx?.workspaceState.get<RunRecord>(KEY);
}

export async function clearLastRun(): Promise<void> {
  if (!ctx) return;
  await ctx.workspaceState.update(KEY, undefined);
}

/** Delete all files/folders created by the last run, deepest first. */
export async function undoLastRun(): Promise<{ removed: number; errors: string[] }> {
  const rec = getLastRun();
  if (!rec || rec.createdPaths.length === 0) return { removed: 0, errors: [] };

  const fs = vscode.workspace.fs;
  // Sort deepest first so files inside folders are removed before the folders
  const sorted = [...rec.createdPaths].sort(
    (a, b) => b.split(path.sep).length - a.split(path.sep).length
  );

  let removed = 0;
  const errors: string[] = [];
  for (const p of sorted) {
    try {
      await fs.delete(vscode.Uri.file(p), { recursive: false, useTrash: true });
      removed++;
    } catch (e: any) {
      errors.push(`${p}: ${e?.message ?? e}`);
    }
  }
  await clearLastRun();
  return { removed, errors };
}