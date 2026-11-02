// Shared fixture builders for HFX schema regression tests.
// A single valid "base" document; individual tests clone and mutate it.

export function baseMetadata() {
  return {
    outputResolution: [
      { locus: "A", resolution: "g" },
      { locus: "B", resolution: "g" }
    ],
    hfeMethod: {
      method: "EM",
      parameters: [{ parameter: "iterations", value: "100" }]
    },
    cohortDescription: {
      species: "Homo sapiens",
      population: [
        { name: "CAU", geoLocation: { ISO3166: "US" }, populationSize: 1000 }
      ],
      cohortSize: 1000,
      dataSource: "Registry"
    },
    nomenclatureUsed: { database: "IPD-IMGT/HLA", version: "3.20.0" },
    producer: {
      name: "Test Author",
      organisation: "Test Org",
      email: "author@example.org"
    },
    frequencyLocation: "inline"
  };
}

export function inlineFrequencyData() {
  return [
    { haplotype: "A*01:01g~B*08:01g", frequency: 0.0123 },
    { haplotype: "A*02:01g~B*44:02g", frequency: 0.0456 }
  ];
}

// A fully valid inline document.
export function validInlineDoc() {
  return {
    version: "0.1.1",
    metadata: baseMetadata(),
    frequencyData: inlineFrequencyData()
  };
}

// A fully valid document that references an external file:// frequency file.
export function validFileRefDoc() {
  const m = baseMetadata();
  m.frequencyLocation = "file://cau.csv";
  return { version: "0.1.1", metadata: m };
}

// A fully valid document that references an external https:// frequency file.
export function validHttpsRefDoc() {
  const m = baseMetadata();
  m.frequencyLocation = "https://example.org/frequencies/cau.csv";
  return { version: "0.1.1", metadata: m };
}
