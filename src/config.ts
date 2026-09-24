import * as vscode from "vscode";

export interface ScaffoldConfig {
  targetFolder: string;
  overwrite: boolean;
  useTemplates: boolean;
  customFileContent: string;
  confirmBeforeCreate: boolean;
}

export function getConfig(): ScaffoldConfig {
  const c = vscode.workspace.getConfiguration("treeScaffold");
  return {
    targetFolder: c.get<string>("targetFolder", "").trim(),
    overwrite: c.get<boolean>("overwrite", false),
    useTemplates: c.get<boolean>("useTemplates", true),
    customFileContent: c.get<string>("customFileContent", ""),
    confirmBeforeCreate: c.get<boolean>("confirmBeforeCreate", true),
  };
}

export function resolveTargetRoot(explicit?: string): string | undefined {
  if (explicit) return explicit;
  const cfg = getConfig();
  if (cfg.targetFolder) return cfg.targetFolder;

  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) return undefined;
  return folders[0].uri.fsPath;
}