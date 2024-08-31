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
      return new vscode.Hover(deduplicate(macros.map((macro) => macro.tooltip)));
    }
  }
}

// https://github.com/mikmart/vscode-sas/issues/3
// getMacroInfoAt() already ensures that all definitions that we get will be
// genuinely different. However two different macros (in different locations),
// can still have an identical signature, which would not be helpful to repeat
// in the tooltip display.
function deduplicate(tooltips: vscode.MarkdownString[]): vscode.MarkdownString[] {
  const uniqueTooltips = new Map();
  for (const tooltip of tooltips) {
    uniqueTooltips.set(tooltip.value, tooltip);
  }
  return [...uniqueTooltips.values()];
}
