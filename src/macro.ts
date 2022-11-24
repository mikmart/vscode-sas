import * as vscode from "vscode";
import { EOL } from "os";

import { getAutocallPaths } from "./config";
import { collect } from "./utils";

interface MacroInfo {
  tooltip: vscode.MarkdownString;
  location: vscode.Location;
}

export async function findMacroInfo(
  document: vscode.TextDocument,
  position: vscode.Position,
  token: vscode.CancellationToken
): Promise<MacroInfo[] | undefined> {
  const macro = getMacroNameAtDocumentPosition(document, position);
  if (!macro) {
    return undefined;
  }

  // Definitions in autocall libraries
  const sasautos = getAutocallPaths();
  const searches = sasautos.map(async (directory) => {
    const sasFiles = await findSasFiles(directory);

    const searches = sasFiles.map(async (file) => {
      const document = await vscode.workspace.openTextDocument(file);
      return findMacroDefinitions(macro, document);
    });

    return collect(searches);
  });

  // Definitions in current document
  searches.push(Promise.resolve(findMacroDefinitions(macro, document)));

  return collect(searches);
}

function getMacroNameAtDocumentPosition(
  document: vscode.TextDocument,
  position: vscode.Position
): string | undefined {
  const range = document.getWordRangeAtPosition(position, /%(?!\d)\w+/);
  if (!range) {
    return undefined; // Not a macro
  } else {
    const start = range.start.translate({ characterDelta: 1 });
    return document.getText(range.with({ start }));
  }
}

async function findSasFiles(directory: vscode.Uri): Promise<vscode.Uri[]> {
  const entries = await vscode.workspace.fs.readDirectory(directory);
  return entries
    .filter(
      ([name, type]: [string, vscode.FileType]) =>
        name.endsWith(".sas") && type === vscode.FileType.File
    )
    .map(([name, _]) => vscode.Uri.joinPath(directory, name));
}

function findMacroDefinitions(
  macro: string,
  document: vscode.TextDocument
): MacroInfo[] {
  // console.log(`Searching for %${macro} in ${document.fileName}.`);
  const definition = new RegExp(`%macro\\s+${macro}\\b`, "i");
  const infos: MacroInfo[] = [];

  let start: vscode.Position | undefined;
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    let lineText = line.text;

    // Look for start of definition if one is not open already
    if (!start) {
      const startColumn = lineText.search(definition);
      if (startColumn > -1) {
        // Found the start of a definition statement
        start = line.range.start.with({ character: startColumn });
        lineText = lineText.slice(startColumn);
      }
    }

    // Might have found a new start on this iteration
    if (start) {
      const endColumn = lineText.search(";");
      if (endColumn > -1) {
        // Found complete definition statement
        const end = line.range.end.with({ character: endColumn + 1 });

        // Assemble macro definition information
        const range = new vscode.Range(start, end);
        const signature = document.getText(range);
        const tooltip = ["```sas", signature, "```"].join(EOL);
        const info: MacroInfo = {
          tooltip: new vscode.MarkdownString(tooltip),
          location: new vscode.Location(document.uri, range),
        };

        infos.push(info);
        start = undefined; // Reset search
      }
    }
  }

  return infos;
}
