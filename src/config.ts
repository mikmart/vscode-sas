import * as vscode from "vscode";

export function getAutocallPaths(): vscode.Uri[] {
  const config = vscode.workspace.getConfiguration("sas");
  const sasautos = config.get<string[]>("sasautos") || [];
  return sasautos.flatMap(substituteVariables).map(vscode.Uri.file);
}

function substituteVariables(text: string): string | string[] {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders) {
    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    text = text.replace("${workspaceRoot}", workspaceRoot);
  }
  return text;
}
