import * as vscode from "vscode";

import { MacroDefinitionProvider } from "./providers/definition";
import { MacroHoverProvider } from "./providers/hover";
import { getAutocallPaths } from "./config";
import { AutocallLibrary, autocalls } from "./macro";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "sas" is now active!');

  // Initialise autocall libraries.
  for (const path of getAutocallPaths()) {
    autocalls.push(new AutocallLibrary(path));
  }
  autocalls.forEach(lib => lib.updateIndex());
  autocalls.forEach(lib => lib.watch());

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
