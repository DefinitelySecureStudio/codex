const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const assert = require('node:assert/strict');
const test = require('node:test');
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const read = path => JSON.parse(readFileSync(resolve(__dirname, '..', path)));
const ajv = new Ajv({ strict: true, strictRequired: false, allErrors: true });
addFormats(ajv);
const validate = ajv.compile(read('schemas/json/execution-provenance/v1/execution-provenance.schema.json'));
const base = read('fixtures/valid/execution-provenance-v1.json');
// These overlays exercise schema constraints alone, not canonical digest checks.
for (const fixture of read('fixtures/execution-provenance-v1-cases.json')) {
  test(fixture.name, () => {
    const document = structuredClone(base);
    for (const [path, value] of Object.entries(fixture.set)) {
      const keys = path.split('.');
      const field = keys.pop();
      const parent = keys.reduce((obj, key) => obj[key], document.record);
      parent[field] = structuredClone(value);
    }
    for (const field of fixture.remove) delete document.record[field];
    assert.equal(validate(document), fixture.valid, JSON.stringify(validate.errors));
  });
}
