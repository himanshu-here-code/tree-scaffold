import * as vscode from "vscode";
import * as path from "path";
import { TreeEntry } from "./parser";
import { defaultContentFor } from "./templates";
import { getConfig } from "./config";
import { recordRun } from "./history";

export interface PlanItem {
  absPath: string;
  isDir: boolean;
  exists: boolean;
  action: "create" | "skip" | "overwrite";
}

export interface Plan {
  root: string;
  items: PlanItem[];
  toCreate: number;
  toSkip: number;
  toOverwrite: number;
}

export interface ApplyResult {
  created: number;
  skipped: number;
  overwritten: number;
  errors: { path: string; message: string }[];
}

/** Build a plan without touching disk. */
export async function buildPlan(
  entries: TreeEntry[],
  targetRoot: string
): Promise<Plan> {
  const fs = vscode.workspace.fs;
  const cfg = getConfig();
  const stack: { depth: number; abs: string }[] = [];
  const items: PlanItem[] = [];

  for (const e of entries) {
    while (stack.length && stack[stack.length - 1].depth >= e.depth) stack.pop();
    const parent = stack.length ? stack[stack.length - 1].abs : targetRoot;
    const abs = e.depth === 0 ? targetRoot : path.join(parent, e.name);

    const exists = await pathExists(abs, fs);
    let action: PlanItem["action"];
    if (!exists) action = "create";
    else if (!e.isDir && cfg.overwrite) action = "overwrite";
    else action = "skip";

    items.push({ absPath: abs, isDir: e.isDir, exists, action });
    stack.push({ depth: e.depth, abs });
  }

  const toCreate = items.filter((i) => i.action === "create").length;
  const toSkip = items.filter((i) => i.action === "skip").length;
  const toOverwrite = items.filter((i) => i.action === "overwrite").length;

  return { root: targetRoot, items, toCreate, toSkip, toOverwrite };
}

/** Apply a plan to disk, with progress + per-item error capture. */
export async function applyPlan(plan: Plan): Promise<ApplyResult> {
  const fs = vscode.workspace.fs;
  const cfg = getConfig();
  const result: ApplyResult = {
    created: 0,
    skipped: 0,
    overwritten: 0,
    errors: [],
  };
  const createdPaths: string[] = [];

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Tree Scaffold",
      cancellable: false,
    },
    async (progress) => {
      const total = plan.items.length;
      let done = 0;

      for (const item of plan.items) {
        done++;
        progress.report({
          message: `${done}/${total}  ${path.basename(item.absPath)}`,
          increment: 100 / total,
        });

        try {
          if (item.isDir) {
            if (!item.exists) {
              await fs.createDirectory(vscode.Uri.file(item.absPath));
              result.created++;
              createdPaths.push(item.absPath);
            } else {
              result.skipped++;
            }
          } else {
            if (item.action === "skip") {
              result.skipped++;
              continue;
            }
            await fs.createDirectory(
              vscode.Uri.file(path.dirname(item.absPath))
            );

            let content = "";
            if (cfg.customFileContent) content = cfg.customFileContent;
            else if (cfg.useTemplates)
              content = defaultContentFor(path.basename(item.absPath));

            await fs.writeFile(
              vscode.Uri.file(item.absPath),
              Buffer.from(content, "utf8")
            );

            if (item.action === "overwrite") {
              result.overwritten++;
            } else {
              result.created++;
              createdPaths.push(item.absPath);
            }
          }
        } catch (err: any) {
          result.errors.push({
            path: item.absPath,
            message: err?.message ?? String(err),
          });
        }
      }
    }
  );

  // Record for undo
  if (createdPaths.length > 0) {
    await recordRun({ root: plan.root, createdPaths, at: Date.now() });
  }

  return result;
}

async function pathExists(
  p: string,
  fs = vscode.workspace.fs
): Promise<boolean> {
  try {
    await fs.stat(vscode.Uri.file(p));
    return true;
  } catch {
    return false;
  }
}