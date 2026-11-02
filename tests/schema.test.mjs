// HFX schema regression tests.
//
// These tests validate HFX documents against the AUTHORITATIVE schema file
// (hfx.schema.json) exactly as published — no in-memory modification of the
// schema (e.g. swapping oneOf -> anyOf) is permitted. This guards against a
// regression of the "inline" frequency-location oneOf bug, where "inline"
// matched BOTH oneOf branches and therefore failed `oneOf` (exactly-one).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  validInlineDoc,
  validFileRefDoc,
  validHttpsRefDoc,
  baseMetadata,
  inlineFrequencyData
} from "./fixtures.mjs";

const schemaPath = fileURLToPath(new URL("../hfx.schema.json", import.meta.url));
const schema = JSON.parse(readFileSync(schemaPath, "utf8"));

// Build a standard Draft 2020-12 validator. We intentionally do NOT enable
// format assertion: per JSON Schema 2020-12, `format` is an annotation by
// default, so the fix must not depend on format being asserted.
function buildValidator() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile(schema);
}

const validate = buildValidator();

function expectValid(doc, label) {
  const ok = validate(doc);
  assert.ok(ok, `${label} should be VALID but got errors: ${JSON.stringify(validate.errors)}`);
}

function expectInvalid(doc, label) {
  const ok = validate(doc);
  assert.ok(!ok, `${label} should be INVALID but validated successfully`);
  return validate.errors;
}

// --- 1. Valid inline HFX document ---------------------------------------
test("valid inline frequency document validates", () => {
  expectValid(validInlineDoc(), "inline document");
});

// --- 2. Valid file:// frequency reference -------------------------------
test("valid file:// frequency reference validates", () => {
  expectValid(validFileRefDoc(), "file:// reference document");
});

// --- 3. Valid https:// frequency reference ------------------------------
test("valid https:// frequency reference validates", () => {
  expectValid(validHttpsRefDoc(), "https:// reference document");
});

// --- 4. Invalid frequency location --------------------------------------
test("invalid frequency location is rejected", () => {
  const doc = validFileRefDoc();
  doc.metadata.frequencyLocation = "not-a-valid-location"; // no scheme, not 'inline'
  const errors = expectInvalid(doc, "bad frequencyLocation");
  assert.ok(
    errors.some((e) => e.instancePath.includes("frequencyLocation")),
    `expected a frequencyLocation error, got: ${JSON.stringify(errors)}`
  );
});

test("empty-string frequency location is rejected", () => {
  const doc = validFileRefDoc();
  doc.metadata.frequencyLocation = "";
  expectInvalid(doc, "empty frequencyLocation");
});

test("near-miss literal 'inlinex' is rejected", () => {
  const doc = validInlineDoc();
  doc.metadata.frequencyLocation = "inlinex";
  expectInvalid(doc, "inlinex frequencyLocation");
});

// --- 5. Missing required metadata ---------------------------------------
test("document missing required metadata field is rejected", () => {
  const doc = validInlineDoc();
  delete doc.metadata.hfeMethod; // hfeMethod is required
  const errors = expectInvalid(doc, "missing hfeMethod");
  assert.ok(
    errors.some((e) => e.message.includes("hfeMethod")),
    `expected a missing hfeMethod error, got: ${JSON.stringify(errors)}`
  );
});

test("document missing top-level required 'version' is rejected", () => {
  const doc = validInlineDoc();
  delete doc.version;
  expectInvalid(doc, "missing version");
});

// --- 6. Otherwise-valid document failing an UNRELATED constraint --------
test("otherwise-valid document with an unrelated violation is rejected", () => {
  const doc = validInlineDoc();
  // Unrelated to frequency location: inject an additional property that
  // `additionalProperties: false` on metadata forbids.
  doc.metadata.unexpectedField = "oops";
  const errors = expectInvalid(doc, "unrelated additionalProperties violation");
  assert.ok(
    errors.some((e) => e.keyword === "additionalProperties"),
    `expected an additionalProperties error, got: ${JSON.stringify(errors)}`
  );
});

test("otherwise-valid document with a bad frequency value is rejected", () => {
  const doc = validInlineDoc();
  doc.frequencyData = inlineFrequencyData();
  doc.frequencyData[0].frequency = "not-a-number"; // frequency must be number
  expectInvalid(doc, "non-numeric frequency");
});

// --- 7. Regression: the original oneOf bug ------------------------------
// Directly exercise the frequencyDataLocation subschema to prove that:
//   (a) "inline" validates (previously it matched BOTH branches -> failed), and
//   (b) the two oneOf branches are mutually exclusive (disjoint), which is the
//       structural property whose absence caused the original bug.
test("regression: 'inline' matches exactly one branch of frequencyDataLocation", () => {
  const loc = schema.$defs.frequencyDataLocation;
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);

  const validateLoc = ajv.compile(loc);
  assert.ok(validateLoc("inline"), "'inline' must validate against frequencyDataLocation");

  // Count how many branches each value satisfies; for oneOf this must be 1.
  const branchValidators = loc.oneOf.map((b) => {
    const a = new Ajv2020({ strict: false });
    addFormats(a);
    return a.compile(b);
  });
  const branchMatches = (val) => branchValidators.filter((fn) => fn(val)).length;

  assert.equal(branchMatches("inline"), 1, "'inline' must match exactly one branch");
  assert.equal(branchMatches("file://cau.csv"), 1, "file URI must match exactly one branch");
  assert.equal(branchMatches("https://x/y.csv"), 1, "https URI must match exactly one branch");
  assert.equal(branchMatches("garbage"), 0, "arbitrary string must match no branch");
});
