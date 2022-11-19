import * as vscode from "vscode";

import { MacroDefinitionProvider } from "./providers/definition";
import { MacroHoverProvider } from "./providers/hover";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "sas" is now active!');

  {
    let provider = new MacroDefinitionProvider();
    let disposable = vscode.languages.registerDefinitionProvider(["sas", "SAS"], provider);
    context.subscriptions.push(disposable);
  }

  {
    let provider = new MacroHoverProvider();
    let disposable = vscode.languages.registerHoverProvider(["sas", "SAS"], provider);
    context.subscriptions.push(disposable);
  }
}
