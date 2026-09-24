import * as vscode from "vscode";
import * as path from "path";
import { parseTree } from "./parser";
import { buildPlan, applyPlan } from "./scaffold";
import { showPlanPreview } from "./preview";
import {
  initHistory,
  undoLastRun,
  getLastRun,
} from "./history";
import { getConfig, resolveTargetRoot } from "./config";

export function activate(context: vscode.ExtensionContext) {
  initHistory(context);

  const runFrom = async (source: string, explicitRoot?: string) => {
    const root = resolveTargetRoot(explicitRoot);
    if (!root) {
      vscode.window.showErrorMessage(
        "Tree Scaffold: no target folder. Open a workspace or set treeScaffold.targetFolder."
      );
      return;
    }

    const entries = parseTree(source);
    if (entries.length === 0) {
      vscode.window.showWarningMessage(
        "Tree Scaffold: no valid tree entries found in the input."
      );
      return;
    }

    const plan = await buildPlan(entries, root);
    await showPlanPreview(plan);

    const cfg = getConfig();

    let proceed = true;
    if (cfg.confirmBeforeCreate) {
      const msg =
        `Create ${plan.toCreate}` +
        (plan.toOverwrite ? `, overwrite ${plan.toOverwrite}` : "") +
        (plan.toSkip ? `, skip ${plan.toSkip}` : "") +
        ` in ${path.basename(root)}?`;
      const pick = await vscode.window.showWarningMessage(
        msg,
        { modal: true },
        "Create",
        "Cancel"
      );
      proceed = pick === "Create";
    }
    if (!proceed) return;

    const result = await applyPlan(plan);

    const parts = [`created ${result.created}`];
    if (result.overwritten) parts.push(`overwritten ${result.overwritten}`);
    if (result.skipped) parts.push(`skipped ${result.skipped}`);

    if (result.errors.length === 0) {
      vscode.window
        .showInformationMessage(
          `Tree Scaffold: ${parts.join(", ")}.`,
          "Undo"
        )
        .then((pick) => {
          if (pick === "Undo") vscode.commands.executeCommand("treeScaffold.undoLast");
        });
    } else {
      vscode.window
        .showErrorMessage(
          `Tree Scaffold: ${parts.join(", ")}, ${result.errors.length} failed.`,
          "Show Errors"
        )
        .then((pick) => {
          if (pick === "Show Errors") {
            const doc = vscode.workspace.openTextDocument({
              content: result.errors
                .map((e) => `${e.path}\n  ${e.message}`)
                .join("\n\n"),
              language: "plaintext",
            });
            doc.then((d) => vscode.window.showTextDocument(d, { preview: true }));
          }
        });
    }
  };

  context.subscriptions.push(
    vscode.commands.registerCommand("treeScaffold.fromSelection", async () => {
      const ed = vscode.window.activeTextEditor;
      if (!ed || ed.selection.isEmpty) {
        vscode.window.showWarningMessage("Tree Scaffold: select a tree first.");
        return;
      }
      await runFrom(ed.document.getText(ed.selection));
    }),

    vscode.commands.registerCommand("treeScaffold.fromClipboard", async () => {
      const text = await vscode.env.clipboard.readText();
      if (!text.trim()) {
        vscode.window.showWarningMessage("Tree Scaffold: clipboard is empty.");
        return;
      }
      await runFrom(text);
    }),

    vscode.commands.registerCommand(
      "treeScaffold.fromFile",
      async (uri?: vscode.Uri) => {
        let fileUri = uri;
        if (!fileUri) {
          const picked = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: { Text: ["txt", "md", "tree"] },
          });
          if (!picked || !picked[0]) return;
          fileUri = picked[0];
        }
        const buf = await vscode.workspace.fs.readFile(fileUri);
        await runFrom(buf.toString());
      }
    ),

    vscode.commands.registerCommand(
      "treeScaffold.intoFolder",
      async (uri?: vscode.Uri) => {
        const target = uri?.fsPath ?? resolveTargetRoot();
        if (!target) return;
        const text = await vscode.env.clipboard.readText();
        if (!text.trim()) {
          vscode.window.showWarningMessage(
            "Tree Scaffold: copy the tree to the clipboard first, then run this."
          );
          return;
        }
        await runFrom(text, target);
      }
    ),

    vscode.commands.registerCommand("treeScaffold.undoLast", async () => {
      const last = getLastRun();
      if (!last) {
        vscode.window.showInformationMessage(
          "Tree Scaffold: nothing to undo."
        );
        return;
      }
      const pick = await vscode.window.showWarningMessage(
        `Undo last run? This will delete ${last.createdPaths.length} items.`,
        { modal: true },
        "Undo",
        "Cancel"
      );
      if (pick !== "Undo") return;
      const { removed, errors } = await undoLastRun();
      if (errors.length === 0) {
        vscode.window.showInformationMessage(
          `Tree Scaffold: removed ${removed} items.`
        );
      } else {
        vscode.window.showWarningMessage(
          `Tree Scaffold: removed ${removed}, ${errors.length} failed.`
        );
      }
    })
  );
}

export function deactivate() {}