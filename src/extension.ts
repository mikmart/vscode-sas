import * as vscode from "vscode";
import { MacroDefinitionProvider } from "./definition";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "sas" is now active!');

  let provider = new MacroDefinitionProvider();
  let disposable = vscode.languages.registerDefinitionProvider(["sas", "SAS"], provider);
  
  context.subscriptions.push(disposable);
}
