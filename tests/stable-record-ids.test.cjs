const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const Ajv = require('ajv/dist/2020');
const read = p => JSON.parse(readFileSync(resolve(__dirname, '..', p)));
const schema = read('rfcs/0009-stable-record-ids/id.schema.json');
const cases = read('rfcs/0009-stable-record-ids/cases.json');
const validate = new Ajv({ strict: true }).compile(schema);
// Test-only inventory oracle; no allocation, storage, access or randomness implementation.
function inventory(records, retired = []) {
  const ids = new Map();
  for (const record of records) {
    assert.ok(validate(record.id), 'malformed ID');
    assert.ok(!ids.has(record.id), 'duplicate ID');
    ids.set(record.id, record);
  }
  for (const record of records) {
    assert.ok(!retired.includes(record.id), 'retired record in current use');
    if (record.id.startsWith('record.relationship.')) {
      for (const id of record.endpoints) {
        assert.ok(validate(id), 'malformed endpoint');
        assert.ok(!id.startsWith('record.relationship.'), 'wrong endpoint kind');
        assert.ok(ids.has(id), 'unresolved endpoint');
        assert.ok(!retired.includes(id), 'retired endpoint');
      }
    }
  }
  return ids;
}
test('proposed ID schema accepts only exact canonical strings', () => {
  for (const id of cases.valid) assert.equal(validate(id), true, id);
  for (const { name, id } of cases.invalid) assert.equal(validate(id), false, name);
});
test('proposed IDs fit existing context safeId syntax without equating identities', () => {
  const context = read('schemas/json/context-packages/v1/context-package.schema.json');
  const safe = new Ajv({ strict: true }).compile(context.$defs.safeId);
  for (const id of cases.valid) assert.equal(safe(id), true);
  assert.equal(validate('source.synthetic-1'), false);
});
test('synthetic inventory and relationship references resolve', () => {
  assert.equal(inventory(cases.records).size, 3);
});
test('duplicate imports and retired reservations cannot be used as new records', () => {
  assert.throws(() => inventory([...cases.records, { ...cases.records[0] }]), /duplicate/);
  assert.throws(() => inventory(cases.records, [cases.records[0].id]), /retired/);
});
test('renaming preserves ID and references', () => {
  const records = structuredClone(cases.records);
  records[0] = cases.rename;
  const ids = inventory(records);
  assert.equal(ids.get(records[2].endpoints[0]).name, 'Renamed Character');
  assert.equal(ids.get(cases.records[0].id).id, cases.records[0].id);
});
test('missing and wrong-kind endpoints fail; incomplete inventories cannot pass', () => {
  for (const endpoint of [cases.missing, cases.records[2].id, 'Example Character']) {
    const records = structuredClone(cases.records);
    records[2].endpoints[0] = endpoint;
    assert.throws(() => inventory(records), /endpoint/);
  }
  assert.throws(() => inventory(cases.records.slice(1)), /unresolved/);
});

test('all RFC 9562 variant 10xx nibbles pass the lowercase v4 profile', () => {
  const [prefix, kind, uuid] = cases.valid[0].split('.');
  for (const variant of '89ab') {
    assert.equal(validate(`${prefix}.${kind}.${uuid.slice(0, 19)}${variant}${uuid.slice(20)}`), true);
  }
});
test('synthetic UUIDv4 suffixes have the standard layout without changing context URNs', () => {
  const { randomUUID } = require('node:crypto');
  // Ephemeral synthetic sample only: validates generator/profile integration, not entropy quality.
  assert.equal(validate(`record.character.${randomUUID()}`), true);
  const context = read('schemas/json/context-builder/v1/context-builder.schema.json');
  const validateContextId = new Ajv({ strict: true }).compile(context.$defs.opaque);
  for (const id of cases.valid) {
    const uuid = id.split('.').at(-1);
    assert.equal(uuid.length, 36);
    assert.equal(uuid[14], '4');
    assert.ok('89ab'.includes(uuid[19]));
    assert.equal(validateContextId(`urn:uuid:${uuid}`), true);
    assert.equal(validateContextId(id), false);
  }
});
