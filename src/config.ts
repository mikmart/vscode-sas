import * as vscode from "vscode";

export function getAutocallPaths(): vscode.Uri[] {
  const config = vscode.workspace.getConfiguration("sas");
  const sasautos = config.get<string[]>("sasautos") || [];
  // config.get() doesn't guarantee the result is of type T.
  if (!Array.isArray(sasautos)) {
    vscode.window.showWarningMessage(
      "The `sas.sasautos` setting has a malformed value. It'll be ignored.",
    );
    return [];
  }
  return sasautos.flatMap(substituteVariables).map(vscode.Uri.file);
}

function substituteVariables(text: string): string | string[] {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders) {
    const roots = workspaceFolders.map((folder) => folder.uri.fsPath);
    return roots.map((root) => text.replace("${workspaceRoot}", root));
  } else {
    return text;
  }
}
