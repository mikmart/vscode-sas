# SAS Macro Definitions for Visual Studio Code

This VS Code extension adds "Go to Definition" and hover tooltips for macro functions in the SAS language.

## Features

The hover tooltip shows the full signature of the macro function, and "Go to Definition" lets you jump directly to the location where the macro function is defined.

![Demonstrating hover tooltip and "Go to Definition" action.](images/demo.gif)

Definitions are found in the current file, and in all `.sas` files in directories listed in the `sas.sasautos` option. The option supports variable substitution for `${workspaceRoot}` to enable relative paths.

## Requirements

You must have another extension adding a SAS language grammar and file association. I use [77qingliu.sas-syntax](https://marketplace.visualstudio.com/items?itemName=77qingliu.sas-syntax).

## Extension Settings

This extension contributes the following settings:

* `sas.sasautos`: Paths to SAS autocall macro libraries. They searched are for macro function definitions. Supports variable substitution for `${workspaceRoot}`. For example: `"${workspaceRoot}/Macros"`.
