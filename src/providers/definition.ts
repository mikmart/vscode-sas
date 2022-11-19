import * as vscode from "vscode";
import { findMacroInfo } from "../macro";

export class MacroDefinitionProvider implements vscode.DefinitionProvider {
  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Location[] | undefined> {
    const macros = await findMacroInfo(document, position, token);
    if (macros) {
      return macros.map((macro) => macro.location);
    }
  }
}
