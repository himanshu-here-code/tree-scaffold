import * as vscode from "vscode";
import { Plan } from "./scaffold";

export async function showPlanPreview(plan: Plan): Promise<void> {
  const lines: string[] = [];
  lines.push(`Tree Scaffold — Plan Preview`);
  lines.push(`Root:    ${plan.root}`);
  lines.push(`Create:  ${plan.toCreate}`);
  lines.push(`Skip:    ${plan.toSkip}`);
  lines.push(`Overwrite: ${plan.toOverwrite}`);
  lines.push("");
  lines.push("─".repeat(80));
  lines.push("");

  for (const item of plan.items) {
    const tag =
      item.action === "create"
        ? "  + "
        : item.action === "overwrite"
        ? "  ~ "
        : "  · ";
    const kind = item.isDir ? "[d]" : "[f]";
    lines.push(`${tag}${kind}  ${item.absPath}`);
  }
  lines.push("");
  lines.push("─".repeat(80));
  lines.push("Legend:  + create    ~ overwrite    · skip");

  const doc = await vscode.workspace.openTextDocument({
    content: lines.join("\n"),
    language: "plaintext",
  });
  await vscode.window.showTextDocument(doc, {
    preview: true,
    viewColumn: vscode.ViewColumn.Beside,
    preserveFocus: true,
  });
}