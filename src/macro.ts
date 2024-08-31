import * as vscode from "vscode";
import { EOL } from "os";

interface MacroInfo {
  name: string;
  location: vscode.Location;
  tooltip: vscode.MarkdownString;
}

export async function getMacroInfoAt(
  document: vscode.TextDocument,
  position: vscode.Position,
  token: vscode.CancellationToken
): Promise<MacroInfo[] | undefined> {
  const macroName = getMacroNameAt(document, position);
  if (!macroName) {
    return undefined;
  }

  // Definitions in the current document.
  const allDefinitions = discoverMacroDefinitions(document);
  const definitions = allDefinitions.filter(macro => macro.name === macroName);

  // Definitions from autocall libraries.
  for (const autocall of autocalls) {
    definitions.push(...autocall.getMacroInfo(macroName));
  }

  return Promise.resolve(deduplicate(definitions));
}

// https://github.com/mikmart/vscode-sas/issues/3
// The same definition can be found multiple times if the same file is found in
// multiple autocall libs (for example via links or just duplicated records),
// or when the current file is inside an autocall path. We would end up with
// the macro definition popping up multiple times without pruning duplicates.
function deduplicate(macros: MacroInfo[]): MacroInfo[] {
  const uniqueMacros = new Map();
  for (const macro of macros) {
    uniqueMacros.set(locationStartToString(macro.location), macro);
  }
  return [...uniqueMacros.values()];
}

function locationStartToString(location: vscode.Location): string {
  return `${location.uri.fsPath}:${location.range.start.line}:${location.range.start.character}`;
}

function getMacroNameAt(
  document: vscode.TextDocument,
  position: vscode.Position
): string | undefined {
  const range = document.getWordRangeAtPosition(position, /%(?!\d)\w+/);
  if (!range) {
    return undefined; // Not a macro
  } else {
    const start = range.start.translate({ characterDelta: 1 });
    return document.getText(range.with({ start })).toUpperCase();
  }
}

function discoverMacroDefinitions(document: vscode.TextDocument): MacroInfo[] {
  const definition = /%macro\s+((?!\d)\w+)\b/i;
  const infos: MacroInfo[] = [];

  let name: string | undefined;
  let start: vscode.Position | undefined;
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    let lineText = line.text;

    // Look for start of definition if one is not open already
    if (!start) {
      const match = definition.exec(lineText);
      if (match) {
        // Found the start of a definition statement
        name = match[1].toUpperCase();
        start = line.range.start.with({ character: match.index });
        lineText = lineText.slice(definition.lastIndex);
      }
    }

    // Might have found a new start on this iteration
    if (name && start) {
      const endColumn = lineText.search(";");
      if (endColumn > -1) {
        // Found complete definition statement
        const end = line.range.end.with({ character: endColumn + 1 });

        // Assemble macro definition information
        const range = new vscode.Range(start, end);
        const signature = document.getText(range);
        const tooltip = ["```sas", signature, "```"].join(EOL);
        const info: MacroInfo = {
          name: name,
          location: new vscode.Location(document.uri, range),
          tooltip: new vscode.MarkdownString(tooltip),
        };

        infos.push(info);

        // Reset search
        name = undefined;
        start = undefined;
      }
    }
  }

  return infos;
}

// Initialised on extension activation.
export const autocalls: AutocallLibrary[] = [];

export class AutocallLibrary {
  uri: vscode.Uri;
  _index: Map<string, MacroInfo[]>;

  constructor(uri: vscode.Uri) {
    this.uri = uri;
    this._index = new Map();
  }

  getMacroInfo(macroName: string): MacroInfo[] {
    return this._index.get(macroName) ?? [];
  }

  async updateIndex() {
    this._index.clear();
    const files = await findSasFiles(this.uri);
    const tasks = files.map((file) => this._addMacrosFromFile(file));
    await Promise.all(tasks);
  }

  async updateIndexForFile(file: vscode.Uri) {
    await this.purgeFileFromIndex(file);
    await this._addMacrosFromFile(file);
  }

  async purgeFileFromIndex(file: vscode.Uri) {
    this._index.forEach((indexed, macroName) => {
      this._index.set(macroName, indexed.filter(macro => {
        return macro.location.uri.toString() !== file.toString();
      }));
    });
  }

  async _addMacrosFromFile(file: vscode.Uri) {
    const document = await vscode.workspace.openTextDocument(file);
    const macros = discoverMacroDefinitions(document);
    for (const macro of macros) {
      if (!this._index.has(macro.name)) {
        this._index.set(macro.name, [macro]);
      } else {
        this._index.get(macro.name)?.push(macro);
      }
    }
  }

  watch(): vscode.FileSystemWatcher {
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(this.uri.fsPath, "*.sas")
    );
    watcher.onDidChange(uri => this.updateIndexForFile(uri));
    watcher.onDidCreate(uri => this.updateIndexForFile(uri));
    watcher.onDidDelete(uri => this.purgeFileFromIndex(uri));
    return watcher;
  }
}

async function findSasFiles(directory: vscode.Uri): Promise<vscode.Uri[]> {
  const entries = await vscode.workspace.fs.readDirectory(directory);
  return entries
    .filter(([name, type]) => name.endsWith(".sas") && type === vscode.FileType.File)
    .map(([name, _]) => vscode.Uri.joinPath(directory, name));
}
