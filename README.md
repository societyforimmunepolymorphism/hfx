# hfx
HFX (Haplotype Frequency eXchange) Format Specification

[hfx.schema.json](hfx.schema.json) is [JSON Schema](https://json-schema.org/) for publishing Haplotype Frequency in HFX format.

## Versioning

The HFX schema is versioned using [Semantic Versioning](https://semver.org/) (e.g., `0.1.0`). This is consistent with the approach used by [HML](http://github.com/immunomath/HML) and [HAML](http://github.com/immunomath/HAML).

Previous schema versions are preserved under the `schema/` directory:

```
schema/
  0_1_0/
    hfx_0_1_0.schema.json
```

The root `hfx.schema.json` always contains the latest version of the schema.

### Releasing a New Version

To release a new schema version (e.g., `0.2.0`):

1. Create a new directory under `schema/` using underscores (e.g., `schema/0_2_0/`).
2. Copy the current `hfx.schema.json` into that directory, named with the version (e.g., `hfx_0_2_0.schema.json`).
3. Update the `version` `const` in the root `hfx.schema.json` to the new version string (e.g., `"0.2.0"`).
4. Make any schema changes in the root `hfx.schema.json`.

## Schema Description

The file `hfx.schema.json` defines the structure of an HFX submission JSON document. At top level the document is an object with the following keys:

- `version` (string, required): the HFX schema version, in semver format (e.g., `"0.1.0"`).
- `metadata`: an object describing the frequency data and provenance. Required.
- `frequencyData`: an optional array of haplotype frequency records when frequency data is inlined.

Key `metadata` properties (high-level):

- `creationDateTime` (string, date-time): timestamp when metadata was created.
- `outputResolution` (array): list of locus/resolution objects describing output resolution. Each item has `locus` (string) and `resolution` (string). HLA resolutions include values like `g`, `G`, `P`, `allele-family`, etc.; KIR uses sequence-level resolutions.
- `hfeMethod` (object): the HFE (Haplotype Frequency Estimation) method with `method` and `parameters` (array of `{parameter, value}` objects).
- `cohortDescription` (object): cohort metadata including `species`, `population` (array), `cohortSize`, and `dataSource`. Each population entry contains `name`, `geoLocation` (with `ISO3166`, optional `subdivision`, `latitude`, `longitude`), optional `populationSize` (numeric), `ethnicity`, `language`, and `religion`.
- `nomenclatureUsed` (object): `database` (one of IPD groups) and `version` string.
- `producer` (object): information about the data producer with `name`, `organisation`, `email`, and optional `publication` (`doi`, `year`).
- `frequencyLocation` (string): either the reserved literal `inline` (when `frequencyData` is included in the document), or a URI with a supported scheme (`http://`, `https://`, `ftp://`, or `file://`) pointing to an external frequency CSV file. The schema treats `inline` and the URI form as two mutually exclusive alternatives, so arbitrary strings without a supported scheme are rejected.
- `frequencyFileHeader` (object, optional): maps expected field names (like `haplotype`, `frequency`, `count`) to the actual header names used in CSV files. Each property value must be a string. Example:

```json
{
	"haplotype": "Haplo",
	"frequency": "Freq",
	"count": "Count"
}
```

- `license` (object): license metadata (name, identifier, licenseDescription).
- `hfxID` (string, URI): unique identifier URI for this HFX submission.

`frequencyData` (when present) is an array of objects with the fields:

- `haplotype` (string): a GL string or haplotype identifier.
- `frequency` (number): numeric frequency.

For the exact constraints and enumerations, see the full JSON Schema in `hfx.schema.json`.
