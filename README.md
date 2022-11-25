# SAS Macro Definitions for VS Code

This Visual Studio Code extension enables "Go to Definition" and hover tooltips for macro functions in the SAS language.

![Demonstrating hover tooltip and "Go to Definition" action.](images/demo.gif)

## Features

The hover tooltip shows the full signature of the macro function, and "Go to Definition" is enabled for jumping to the location where the macro function is defined.

Macro function definitions are found in the current file, and in all `.sas` files in directories listed in the `sas.sasautos` option. The option supports variable substitution for `${workspaceRoot}` to enable relative paths.

## Requirements

You must have another extension that contributes a SAS language grammar and file association. I use [77qingliu.sas-syntax](https://marketplace.visualstudio.com/items?itemName=77qingliu.sas-syntax).

## Extension Settings

This extension contributes the following settings:

* `sas.sasautos`: Paths to SAS autocall macro libraries. They searched are for macro function definitions. Supports variable substitution for `${workspaceRoot}`. For example: `"${workspaceRoot}/Macros"`.
