# Changelog

All notable changes to the HFX schema are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- **`frequencyLocation` / `frequencyDataLocation` `oneOf` bug.** A valid HFX
  document using inline frequency data (`"frequencyLocation": "inline"`) failed
  schema validation under a spec-compliant JSON Schema Draft 2020-12 validator.

  Root cause: `$defs/frequencyDataLocation` was defined as a `oneOf` of two
  string alternatives — `{ "type": "string", "format": "uri" }` and
  `{ "type": "string", "enum": ["inline"] }`. Because `format` is an annotation
  (not an assertion) by default in Draft 2020-12, the first branch reduces to
  "any string", so `"inline"` matched *both* branches. `oneOf` requires exactly
  one match, so the document was rejected.

  Fix: the two alternatives are now mutually exclusive and no longer depend on
  `format` being asserted:
  - Branch 1 is `{ "const": "inline" }` — the reserved literal.
  - Branch 2 is `{ "type": "string", "pattern": "^(https?|ftps?|file)://.+", "format": "uri" }`
    — an external reference that must carry a supported URI scheme
    (`http`, `https`, `ftp`, `ftps`, `file`). `format: uri` is retained as a
    documentation annotation only.

  Consumers no longer need to rewrite the schema in memory (e.g. swapping
  `oneOf` for `anyOf`) to validate conforming HFX documents. `"inline"`,
  `file://…`, `https://…` (etc.) all validate; arbitrary strings without a
  supported scheme are rejected.

### Changed

- Corrected repository example documents that unintentionally violated the
  v0.1.1 schema:
  - Added the required top-level `version` field to all example
    `*.hfx-metadata.json` files.
  - Removed the stale `checkSum` property from the `csv-frequency` examples
    (`checkSum` was dropped from the schema in the 0.1.1 series; `metadata`
    uses `additionalProperties: false`).
  - `examples/inline-frequency/invalid-cau.hfx-metadata.json` remains
    deliberately invalid (its `outputRResolution` typo is intentional for
    negative-test purposes).

### Added

- A Node-based regression test suite (`tests/`) that validates HFX documents
  against the authoritative `hfx.schema.json` using a standard Draft 2020-12
  validator (ajv), with no in-memory schema modification. Run with `npm test`.

### Versioning note

The schema `version` constant is intentionally left at `0.1.1`. Because
`properties.version` is a strict `const`, bumping it to `0.1.2` would cause the
new schema to *reject* every existing document that declares
`"version": "0.1.1"`. This correction is backward-compatible — it only makes
previously intended-valid documents validate and does not change the data
model — so bumping the `const` is deferred to a maintainer decision. See the
pull request discussion for details.
