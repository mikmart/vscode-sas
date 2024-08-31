# Change Log

All notable changes to the "sas" extension will be documented in this file.

## [0.2.2] - 2024-08-31

- Fixed an issue that sometimes caused the hover tooltip to display the macro
  signature multiple times (#3).

## [0.2.1] - 2024-06-15

- Added an example of settings usage in a `settings.json` file (#2).
- Fixed an issue that caused the extension to fail to initialise if settings
  were provided in an unexpected format.

## [0.2.0] - 2024-03-04

- Macro definitions in autocall libraries are now _cached_ for notably better
  performance with large libraries and/or slow filesystems.

## [0.1.1] - 2022-11-25

- Refined README to better describe the extension. No functional changes.

## [0.1.0] - 2022-11-24

- Added a hover provider for macro definitions, showing the signature (#1).
- Changed `${workspaceRoot}` to now expand into _all_ workspace root paths for multi-root workspaces, not only the first root path.

## [0.0.2] - 2021-02-05

- Added missing documentation for `${workspaceRoot}` variable substitution.

## [0.0.1]

- Initial release.
