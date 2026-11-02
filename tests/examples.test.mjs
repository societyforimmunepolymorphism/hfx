// Validates the repository's real example HFX documents against the
// authoritative schema. Deliberately-invalid examples (prefixed "invalid-")
// are expected to fail; all other examples are expected to pass.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, globSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schema = JSON.parse(
  readFileSync(fileURLToPath(new URL("../hfx.schema.json", import.meta.url)), "utf8")
);
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const root = fileURLToPath(new URL("../", import.meta.url));
const files = globSync("examples/**/*.hfx-metadata.json", { cwd: root }).sort();

assert.ok(files.length > 0, "expected to find example .hfx-metadata.json files");

for (const rel of files) {
  const deliberatelyInvalid = basename(rel).startsWith("invalid-");
  test(`example ${rel} is ${deliberatelyInvalid ? "INVALID (expected)" : "VALID"}`, () => {
    const doc = JSON.parse(readFileSync(root + rel, "utf8"));
    const ok = validate(doc);
    if (deliberatelyInvalid) {
      assert.ok(!ok, `${rel} is a deliberately-invalid example but it validated`);
    } else {
      assert.ok(ok, `${rel} should be valid, errors: ${JSON.stringify(validate.errors)}`);
    }
  });
}
