import * as vscode from "vscode";

export class MacroDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ) {
    const macro = getMacroAtDocumentPosition(document, position);
    if (!macro) {
      return undefined;
    }

    // Definitions in autocall libraries
    const sasautos = getAutocallPaths();
    const searches = sasautos.map(vscode.Uri.file).map(async (directory) => {
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
}

function getMacroAtDocumentPosition(
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

function getAutocallPaths(): string[] {
  const config = vscode.workspace.getConfiguration("sas");
  const sasautos = config.get<string[]>("sasautos") || [];
  return sasautos.flatMap(substituteVariables);
}

function substituteVariables(text: string): string | string[] {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders) {
    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    text = text.replace("${workspaceRoot}", workspaceRoot);
  }
  return text;
}

async function collect<T>(searches: Promise<T[]>[]): Promise<T[]> {
  const results = await Promise.all(
    searches.map((promise) =>
      promise.catch((reason) => {
        console.error(reason);
        return [] as T[];
      })
    )
  );
  return results.flat();
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
): vscode.Location[] {
  // console.log(`Searching for %${macro} in ${document.fileName}.`);
  const definition = new RegExp(`%macro\\s+${macro}\\b`, "i");
  const locations: vscode.Location[] = [];
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    if (line.text.search(definition) > -1) {
      locations.push(new vscode.Location(document.uri, line.range));
    }
  }
  return locations;
}
