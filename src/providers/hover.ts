import * as vscode from "vscode";
import { getMacroInfoAt } from "../macro";

export class MacroHoverProvider implements vscode.HoverProvider {
  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | undefined> {
    const macros = await getMacroInfoAt(document, position, token);
    if (macros) {
      return new vscode.Hover(macros.map((macro) => macro.tooltip));
    }
  }
}
