const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const assert = require('node:assert/strict');
const test = require('node:test');
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const { verifyScenario, validateFailure, identity, sha } = require('./support/context-builder-oracle.cjs');
const read = p => JSON.parse(readFileSync(resolve(__dirname, '..', p)));
const ajv = new Ajv({ strict: true, strictRequired: false, strictTypes: false, allErrors: true });
addFormats(ajv);
const cpBytes = readFileSync(resolve(__dirname, '../schemas/json/context-packages/v1/context-package.schema.json'));
ajv.addSchema(JSON.parse(cpBytes));
const validate = ajv.compile(read('schemas/json/context-builder/v1/context-builder.schema.json'));
const base = read('fixtures/context-builder-v1.json');
const documents = s => [s.request, ...s.normalized, s.result, s.failed, s.receipt];
function schemaValid(s) { for (const d of documents(s)) assert.equal(validate(d), true, JSON.stringify(validate.errors)); }
function rebind(s) { for (const n of s.normalized) n.request_identity = identity(s.request); s.result.request_identity = identity(s.request); }
function rehashPackage(s) { s.result.package.manifest_identity = identity(s.result.package.manifest); }

test('released Context Package bytes are unchanged; every synthetic document validates', () => {
  assert.equal(sha(cpBytes), 'sha256:d81e88780511c31099b2dd925f31aff26d6ba75e1173e953b98a37298764b617');
  schemaValid(base); verifyScenario(base); validateFailure(base.failed, base.request);
});
test('all top-level document kinds reject unknown fields and future versions', () => {
  for (const d of documents(base)) {
    assert.equal(validate({ ...d, unexpected: true }), false);
    assert.equal(validate({ ...d, spec_version: '1.1.0' }), false);
  }
});
for (const c of read('fixtures/context-builder-v1-cases.json')) test(c.name, () => {
  const s = structuredClone(base); const parent = c.path.slice(0, -1).reduce((v, k) => v[k], s); parent[c.path.at(-1)] = c.value;
  if (c.layer === 'schema') { assert.equal(validate(s[c.path[0]]), false); return; }
  if (c.path[0] === 'request') rebind(s);
  if (c.path[0] === 'result' && c.path[1] === 'package') rehashPackage(s); // Even rehashed unrelated output must fail.
  schemaValid(s);
  assert.throws(() => c.layer === 'failure' ? validateFailure(s.failed, s.request) : verifyScenario(s));
});
test('object key and source acquisition order do not affect semantic output', () => {
  const s = structuredClone(base); s.request = Object.fromEntries(Object.entries(s.request).reverse());
  s.normalized.reverse(); s.raw_sources.reverse(); verifyScenario(s);
});
test('noncanonical source enumeration and duplicate source IDs fail', () => {
  for (const change of [s => s.request.sources.reverse(), s => s.request.sources.push(s.request.sources[0])]) {
    const s = structuredClone(base); change(s); rebind(s); assert.throws(() => verifyScenario(s));
  }
});
test('ineligible authority, continuity, expired review and classification fail before selection', () => {
  for (const change of [s => s.request.authority_ids = [], s => s.request.continuity_id = s.request.caller_id,
    s => s.request.evaluation_time = s.request.sources[0].review_after, s => s.request.max_classification = 'public']) {
    const s = structuredClone(base); change(s); rebind(s); assert.throws(() => verifyScenario(s));
  }
});
test('conflicting eligible claims cannot be hidden by ranking or omissions', () => {
  const s = structuredClone(base);
  for (let i = 0; i < 2; i++) {
    s.request.sources[i].fragments[0].claim_id = s.request.caller_id;
    s.normalized[i].source = structuredClone(s.request.sources[i]);
    s.normalized[i].candidates[0].claim_id = s.request.caller_id;
  }
  rebind(s); schemaValid(s); assert.throws(() => verifyScenario(s));
});
test('preparation bound shortening cannot be ignored by a rehashed package', () => {
  const s = structuredClone(base); s.preparation_bounds.review_after = '2026-09-15T13:00:00Z';
  assert.throws(() => verifyScenario(s));
  s.result.package.manifest.review_after = s.preparation_bounds.review_after; rehashPackage(s); verifyScenario(s);
});
test('optional budget omission preserves required slots and records exact reason', () => {
  const s = structuredClone(base); s.request.slots[2].selection.candidates = structuredClone(s.request.slots[0].selection.candidates);
  s.request.limits.total_content_bytes = s.result.package.manifest.total_content_bytes;
  s.result.omissions[0].code = 'OPTIONAL_BUDGET'; rebind(s); schemaValid(s); verifyScenario(s);
  s.result.omissions[0].code = 'OPTIONAL_EMPTY'; assert.throws(() => verifyScenario(s));
});
test('lexical-v1 fixture agrees with deterministic text selection and empty optional query', () => {
  const s = read('fixtures/context-builder-lexical-v1.json'); schemaValid(s); verifyScenario(s);
  s.request.slots[0].selection.query = 'NO_MATCH'; rebind(s); assert.throws(() => verifyScenario(s));
});
test('fragment extraction detects splitting multibyte Unicode and absent JSON pointers', () => {
  const s = structuredClone(base); s.raw_sources[0].text = 'é';
  s.request.sources[0].reference.artifact.byte_size = 2; s.request.sources[0].reference.artifact.sha256 = sha('é');
  s.request.sources[0].fragments[0].fragment.end = 1;
  s.normalized[0].source = structuredClone(s.request.sources[0]); s.normalized[0].candidates[0].fragment.end = 1; rebind(s);
  assert.throws(() => verifyScenario(s));
  const j = structuredClone(base); j.request.sources[1].fragments[0].fragment.pointer = '/absent';
  j.normalized[1].source = structuredClone(j.request.sources[1]); j.normalized[1].candidates[0].fragment.pointer = '/absent'; rebind(j);
  assert.throws(() => verifyScenario(j));
});
