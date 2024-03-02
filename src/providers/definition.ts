import * as vscode from "vscode";
import { getMacroInfoAt } from "../macro";

export class MacroDefinitionProvider implements vscode.DefinitionProvider {
  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Location[] | undefined> {
    const macros = await getMacroInfoAt(document, position, token);
    if (macros) {
      return macros.map((macro) => macro.location);
    }
  }
}
