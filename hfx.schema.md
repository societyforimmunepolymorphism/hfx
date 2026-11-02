# HFX JSON Schema (Markdown)

This document is a human-friendly Markdown version of the `hfx.schema.json` JSON Schema used to validate HFX (Haplotype Frequency eXchange) submission documents.

## Overview

An HFX document is a JSON object with the following top-level properties:

- `version` (required): the HFX schema version string (currently `"0.1.1"`).
- `metadata` (required): an object describing provenance and structure of the frequency data.
- `frequencyData` (optional): an array of frequency records when the data is inlined.

See the canonical schema file `hfx.schema.json` for exact constraints.

---

## Top-level properties

- `version` (string, required): the HFX schema version, matching the schema's `version` constant (currently `"0.1.1"`).
- `metadata` (object, required)
  - `creationDateTime` (string, date-time)
  - `outputResolution` (array): list of locus/resolution objects. Items reference either HLA or KIR resolution definitions.
  - `hfeMethod` (object): HFE method with `method` (string) and `parameters` (array of `{parameter, value}` objects).
  - `cohortDescription` (object): cohort metadata including `species`, `population` (array), `cohortSize` (number), and `dataSource`.
  - `nomenclatureUsed` (object): `database` and `version`.
  - `producer` (object): `name`, `organisation`, `email`, optional `publication`.
  - `frequencyLocation` (string, required): either the reserved literal `inline` (when frequency records are embedded in `frequencyData`), or a URI with a supported scheme (`http://`, `https://`, `ftp://`, or `file://`) pointing to an external frequency file.
  - `frequencyFileHeader` (object, optional): mapping of expected CSV field names to actual header strings.
  - `license` (object)

- `frequencyData` (array, optional): inlined frequency records. Each item has:
  - `haplotype` (string): GL String
  - `frequency` (number)

## Important definitions (summary)

- `hlaResolution` — array of `{locus: string, resolution: string}` where `resolution` enum includes `g`, `G`, `P`, `allele-family`, `protein-sequence`, `coding-sequence`, `genomic-sequence`, `Serology`.
- `kirResolution` — array of `{locus, resolution}` with sequence-level resolution enum.
- `hfeMethod` — object with `method` and `parameters` (array of `{parameter, value}` strings).
- `cohort` — object describing the cohort. `population` is an array of objects each containing `name`, `geoLocation` (must include `ISO3166`, may include `subdivision`, `latitude`, `longitude`), optional `populationSize` (number), `ethnicity`, `populationDescription`, `language`, `religion`.
- `nomenclature` — `database` enum (IPD groups) and `version`.
- `producer` — required `name`, `organisation`, `email`, optional `publication` (`doi`, `year`).
- `frequencyData` — array of `{haplotype: string, frequency: number}`.
- `frequencyDataLocation` — `oneOf`: the reserved literal `inline`, **or** a URI string whose scheme is one of `http`, `https`, `ftp`, `ftps`, or `file`. The two alternatives are mutually exclusive, so exactly one matches any valid value. Arbitrary strings without a supported scheme are rejected.
- `license` — object with `name`, `identifier`, `licenseDescription`.
- `frequencyFileHeader` — object mapping expected field names (e.g., `haplotype`, `frequency`, `count`) to the actual column header strings in CSV files.

## Example `frequencyFileHeader`

```json
{
  "haplotype": "Haplo",
  "frequency": "Freq",
  "count": "Count"
}
```

## Full JSON Schema

The authoritative schema is the JSON Schema file
[`hfx.schema.json`](hfx.schema.json) in the repository root. It is the single
source of truth; this document is a human-friendly companion. Always validate
against `hfx.schema.json` (or the version-pinned copy under `schema/`) rather
than a copy embedded in prose.
