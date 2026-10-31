const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const assert = require('node:assert/strict');
const test = require('node:test');
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const read = p => JSON.parse(readFileSync(resolve(__dirname, '..', p)));
const schema = read('schemas/json/comic-manifest/v1.1/comic-build-result.schema.json');
const ajv = new Ajv({ strict: true, strictRequired: false, strictTypes: false }); addFormats(ajv);
const validate = ajv.compile(schema);
const base = read('fixtures/comic-build-result-v1.1-candidate.json');
const old = ajv.compile(read('schemas/json/comic-manifest/v1/comic-manifest.schema.json'));
test('candidate schema accepts truthful no-output shape; v1 rejects exact new version', () => {
  assert.equal(validate(base.result), true, JSON.stringify(validate.errors));
  assert.equal(old(base.result), false);
  assert.equal(schema.$id, 'urn:definitely-secure:contract:comic-manifest:1.1.0:comic-build-result');
  assert.deepEqual(base.result.execution.transformations[0].input_digests,
    [base.production.inputs.canon.artifact.sha256, base.production.inputs.prompts[0].identity.sha256]);
});
for (const c of read('fixtures/comic-build-result-v1.1-candidate-cases.json')) test(`candidate rejects ${c.name}`, () => {
  const r = structuredClone(base.result);
  const parent = c.path.slice(0, -1).reduce((x, k) => x[k], r); parent[c.path.at(-1)] = c.value;
  assert.equal(validate(r), false);
});
test('existing result representations remain structurally supported under explicit 1.1 result capability', () => {
  const r = read('fixtures/comic-manifest-v1.json').result;
  r.spec_version = '1.1.0'; assert.equal(validate(r), true);
});
