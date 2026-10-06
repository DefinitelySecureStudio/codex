const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const assert = require('node:assert/strict');
const test = require('node:test');
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const { verifyScenario, verifyProduction, verifyResult, productionRef, identity, canonical, sha } = require('./support/comic-manifest-oracle.cjs');
const read = path => JSON.parse(readFileSync(resolve(__dirname, '..', path)));
const schema = read('schemas/json/comic-manifest/v1/comic-manifest.schema.json');
const ajv = new Ajv({ strict: true, strictRequired: false, strictTypes: false, allErrors: true }); addFormats(ajv);
const validate = ajv.compile(schema), approval = ajv.compile({ $ref: schema.$id + '#/$defs/approval' });
const base = read('fixtures/comic-manifest-v1.json'), foundation = read('fixtures/context-builder-v1.json');
const approvalTimeCases = read('fixtures/comic-manifest-v1-approval-times.json');
function schemaValid(s) {
  for (const k of ['production','result','release']) assert.equal(validate(s[k]), true, `${k}: ${JSON.stringify(validate.errors)}`);
  for (const a of s.approvals) assert.equal(approval(a), true, JSON.stringify(approval.errors));
}
// Simulates fresh explicit fixture decisions after an edit, never runtime approval.
function rebind(s) {
  s.result.production = productionRef(s.production); s.result.inputs = structuredClone(s.production.inputs);
  s.linkage.production = productionRef(s.production); s.linkage.result_identity = identity(s.result); s.linkage.release_identity = identity(s.release);
  for (const a of s.approvals) {
    a.subject = identity(a.role === 'production-reviewer' ? s.production : s.release);
    a.artifact_digests = a.role === 'production-reviewer' ? [] : s.release.outputs.map(x=>x.artifact.sha256).sort();
    a.scope = structuredClone(s.release.scope);
  }
  s.trust.approvals = s.approvals.map(a=>({ decision_id:a.decision_id, sha256:identity(a).sha256 }));
  if (s.trust.attestation) s.trust.attestation.linkage_identity = identity(s.linkage);
}
function addSyntheticOutput(s, { renditionId, profileId, mediaType, dimensions, placeholder, maxBytes }) {
  const raw = placeholder;
  const req = {
    rendition_id: renditionId, required: true,
    profile: { profile_id: profileId, profile_version: '1.0.0' },
    media_type: mediaType, dimensions, max_bytes: maxBytes ?? Buffer.byteLength(raw),
    alt_text: 'Synthetic accessibility description.',
    transcript: s.production.renditions[0].transcript,
    rights_notice: 'Synthetic fixture; no rights assertion.'
  };
  s.production.renditions.push(req);
  s.output_bytes[renditionId] = raw;
  const digest = sha(raw);
  const output = {
    rendition_id: renditionId,
    artifact: {
      artifact_uri: 'urn:uuid:10000000-0000-4000-8000-000000000011',
      media_type: mediaType, byte_size: Buffer.byteLength(raw), sha256: digest
    },
    profile: structuredClone(req.profile), dimensions: structuredClone(dimensions),
    max_bytes: req.max_bytes, alt_text: req.alt_text,
    transcript: req.transcript, rights_notice: req.rights_notice
  };
  s.result.outputs.push(output);
  s.release.outputs.push({ ...structuredClone(output), artifact: {
    ...output.artifact, artifact_uri: `https://example.invalid/synthetic/${renditionId}`
  } });
  s.result.execution.transformations[0].output_digests.push(digest);
  s.release.execution.transformations[0].output_digests.push(digest);
  rebind(s);
  return s;
}
test('synthetic three-record slice and detached approvals validate', () => { schemaValid(base); verifyScenario(base, foundation); });
test('every structured object is closed', () => {
  function walk(x) {
    if (!x || typeof x !== 'object') return;
    if (x.type === 'object') assert.equal(x.additionalProperties, false);
    for (const v of Object.values(x)) walk(v);
  }
  walk(schema);
});
for (const kind of ['production','result','release']) for (const [field,value] of [['unexpected',true],['spec_version','1.1.0'],['kind','unknown']])
  test(`${kind} rejects ${field}`, () => assert.equal(validate({...base[kind],[field]:value}),false));
test('all detached approval fields are closed and exactly versioned', () => {
  assert.equal(approval({...base.approvals[0],allow:true}),false);
  assert.equal(approval({...base.approvals[0],spec_version:'2.0.0'}),false);
});
for (const c of approvalTimeCases) test(c.name, () => {
  const s = structuredClone(base);
  s.at = c.action_time;
  s.release.scope.publication_time = c.publication_time;
  for (const a of s.approvals) {
    a.decided_at = c.decided_at;
    a.expires_at = c.expires_at;
  }
  s.release.approvers = s.approvals.filter(a => a.role !== 'production-reviewer')
    .map(({ decision_id, role, actor, decided_at }) => ({ decision_id, role, actor, decided_at }));
  rebind(s);
  schemaValid(s);
  if (c.valid) verifyScenario(s, foundation);
  else assert.throws(() => verifyScenario(s, foundation), /APPROVAL_TIME/);
});
for (const c of read('fixtures/comic-manifest-v1-cases.json')) test(c.name, () => {
  const s = structuredClone(base);
  for (const edit of c.edits) {
    const parent = edit.path.slice(0,-1).reduce((o,k)=>o[k],s);
    if (edit.remove) delete parent[edit.path.at(-1)]; else parent[edit.path.at(-1)] = edit.value;
  }
  if (c.layer === 'schema') {
    const record = c.edits[0].path[0];
    assert.equal(record === 'approvals' ? approval(s.approvals[c.edits[0].path[1]]) : validate(s[record]), false); return;
  }
  if (c.rebind) rebind(s);
  schemaValid(s);
  assert.throws(()=>verifyScenario(s,foundation),new RegExp(c.code));
});
test('a public-only authored fixture needs no package or private attestation', () => {
  const s=structuredClone(base); s.production.inputs.prompts=[];
  for(const p of s.production.panels)p.prompt_bindings=[];
  s.production.classification=s.result.classification='public';s.release.dependencies=structuredClone(s.production.inputs.dependencies);
  s.release.private_context={influenced:false}; delete s.linkage.attestation_reference;
  s.approvals=s.approvals.filter(a=>a.role!=='disclosure-reviewer');s.release.approvers=s.release.approvers.filter(a=>a.role!=='disclosure-reviewer');
  s.trust.attestation=null; rebind(s);schemaValid(s);verifyScenario(s,foundation);
});
test('a correction preserves publication identity and history but gets new revisions/approvals', () => {
  const original=canonical(base);const s=structuredClone(base);
  s.production.previous=productionRef(base.production);s.production.revision=2;s.production.panels.reverse();
  s.release.previous={release_id:base.release.release_id,episode_id:base.release.episode_id,revision:1,identity:identity(base.release)};
  s.release.revision=2;s.release.release_id='urn:uuid:10000000-0000-4000-8000-000000000999';
  rebind(s);schemaValid(s);verifyScenario(s,foundation);assert.equal(canonical(base),original);
});
test('partial and failed records preserve evidence but cannot support release', () => {
  for(const status of ['partial','failed']) {
    const s=structuredClone(base);s.result.status=status;s.result.outputs=[];s.result.diagnostics=['OUTPUT_MISSING'];rebind(s);schemaValid(s);
    verifyResult(s.production,s.result,s.output_bytes);assert.throws(()=>verifyScenario(s,foundation),/RESULT_NOT_COMPLETE/);
  }
});
test('deterministic canonical identity preserves array order, Unicode and content', () => {
  assert.deepEqual(identity({z:'é',a:[1,2]}),identity({a:[1,2],z:'é'}));
  assert.notDeepEqual(identity({a:[1,2]}),identity({a:[2,1]}));
  assert.notDeepEqual(identity({a:'é'}),identity({a:'e\u0301'}));
  const s=structuredClone(base);s.production=Object.fromEntries(Object.entries(s.production).reverse());verifyScenario(s,foundation);
});
test('nested asset, rendition and panel boundaries reject extensions', () => {
  for(const [path,key] of [[['panels',0],'execute'],[['renditions',0],'extra'],[['inputs','prompts',0,'context'],'allow']]) {
    const p=structuredClone(base.production);path.reduce((o,k)=>o[k],p)[key]='untrusted';assert.equal(validate(p),false);
  }
});
test('released foundation schema identities remain unchanged', () => {
  for (const [path,digest] of [
    ['context-packages/v1/context-package.schema.json','d81e88780511c31099b2dd925f31aff26d6ba75e1173e953b98a37298764b617'],
    ['context-builder/v1/context-builder.schema.json','4adebedcef5a26e009e1d53ec9c480d372a31b73211fec1c53d6509ebc7929a3'],
    ['prompt-contracts/v1/prompt-definition.schema.json','6ac345956582d25c2db9c81b85cab9c73b2cbcfc79b8aac7a43d847c07173cb9']
  ]) assert.equal(sha(readFileSync(resolve(__dirname,'../schemas/json',path))),'sha256:'+digest);
});
test('missing one required rendition fails even with another valid output', () => {
  const s=structuredClone(base);s.production.renditions.push({...s.production.renditions[0],rendition_id:'second-required'});rebind(s);schemaValid(s);
  assert.throws(()=>verifyScenario(s,foundation),/REQUIRED_OUTPUT/);
});
test('versioned image/document profiles accept their exact media, pixel and byte boundaries', () => {
  // Placeholder output bytes intentionally do not claim to be rendered media.
  const image = addSyntheticOutput(structuredClone(base), {
    renditionId: 'page', profileId: 'comic-page-image', mediaType: 'image/png',
    dimensions: { width: 8192, height: 4096 }, placeholder: 'SYNTHETIC-IMAGE-PLACEHOLDER'
  });
  schemaValid(image); verifyScenario(image, foundation);
  const document = addSyntheticOutput(structuredClone(base), {
    renditionId: 'document', profileId: 'comic-portable-document', mediaType: 'application/pdf',
    dimensions: null, placeholder: 'SYNTHETIC-DOCUMENT-PLACEHOLDER', maxBytes: 50_000_000
  });
  schemaValid(document); verifyScenario(document, foundation);
});
test('raster profiles reject side and pixel limits just above their inclusive boundary', () => {
  for (const dimensions of [{ width: 8192, height: 4097 }, { width: 8193, height: 1 }]) {
    const s = addSyntheticOutput(structuredClone(base), {
      renditionId: 'page', profileId: 'comic-page-image', mediaType: 'image/png',
      dimensions, placeholder: 'SYNTHETIC-IMAGE-PLACEHOLDER'
    });
    schemaValid(s); assert.throws(() => verifyScenario(s, foundation), /RENDITION_DIMENSIONS/);
  }
});
test('actual artifact bytes cannot exceed the declared rendition cap', () => {
  const size = Buffer.byteLength('SYNTHETIC-IMAGE-PLACEHOLDER');
  const exact = addSyntheticOutput(structuredClone(base), {
    renditionId: 'page', profileId: 'comic-page-image', mediaType: 'image/webp',
    dimensions: { width: 1, height: 1 }, placeholder: 'SYNTHETIC-IMAGE-PLACEHOLDER', maxBytes: size
  });
  schemaValid(exact); verifyScenario(exact, foundation);
  const over = addSyntheticOutput(structuredClone(base), {
    renditionId: 'page', profileId: 'comic-page-image', mediaType: 'image/webp',
    dimensions: { width: 1, height: 1 }, placeholder: 'SYNTHETIC-IMAGE-PLACEHOLDER', maxBytes: size - 1
  });
  schemaValid(over); assert.throws(() => verifyScenario(over, foundation), /OUTPUT_LIMIT/);
});
test('complete result rejects a missing required output and duplicate output IDs', () => {
  const missing = addSyntheticOutput(structuredClone(base), {
    renditionId: 'page', profileId: 'comic-page-image', mediaType: 'image/png',
    dimensions: { width: 1, height: 1 }, placeholder: 'SYNTHETIC-IMAGE-PLACEHOLDER'
  });
  missing.result.outputs.pop(); rebind(missing); schemaValid(missing);
  assert.throws(() => verifyScenario(missing, foundation), /REQUIRED_OUTPUT/);
  const duplicate = addSyntheticOutput(structuredClone(base), {
    renditionId: 'page', profileId: 'comic-page-image', mediaType: 'image/png',
    dimensions: { width: 1, height: 1 }, placeholder: 'SYNTHETIC-IMAGE-PLACEHOLDER'
  });
  duplicate.result.outputs.push(structuredClone(duplicate.result.outputs.at(-1)));
  rebind(duplicate); schemaValid(duplicate);
  assert.throws(() => verifyScenario(duplicate, foundation), /OUTPUT_ID/);
});
test('public release preserves exact selected output profile and metadata', () => {
  const s = structuredClone(base);
  s.release.outputs[0].profile.profile_id = 'comic-page-image';
  rebind(s); schemaValid(s);
  assert.throws(() => verifyScenario(s, foundation), /RELEASE_OUTPUTS/);
});
test('profile and accessibility fields cannot be omitted from any rendition/output record', () => {
  for (const [kind, record] of [['production', 'renditions'], ['result', 'outputs'], ['release', 'outputs']]) {
    for (const field of ['profile', 'max_bytes', 'alt_text', 'transcript', 'rights_notice']) {
      const s = structuredClone(base); delete s[kind][record][0][field];
      assert.equal(validate(s[kind]), false, `${kind}.${record}.${field}`);
    }
  }
});
test('public asset references resolve and contribute exact public dependencies', () => {
  const s=structuredClone(base);s.production.inputs.assets=[{asset_id:'synthetic-asset',classification:'public',reference:{kind:'public',dependency:s.production.inputs.canon},rights_notice:'Synthetic fixture.'}];
  s.production.panels[0].asset_ids=['synthetic-asset'];s.release.dependencies.push(structuredClone(s.production.inputs.canon));
  rebind(s);schemaValid(s);verifyScenario(s,foundation);
  s.production.inputs.assets[0].classification='internal';rebind(s);schemaValid(s);assert.throws(()=>verifyScenario(s,foundation),/CLASSIFICATION/);
});
test('public transformation summaries cannot invent input lineage', () => {
  const s=structuredClone(base);s.release.execution.transformations[0].input_digests=[s.release.dependencies[0].artifact.sha256];rebind(s);schemaValid(s);
  assert.throws(()=>verifyScenario(s,foundation),/TRANSFORMATION_LINK/);
});
test('altered artifacts, destination and private projection invalidate exact approvals', () => {
  for(const mutate of [
    s=>s.release.scope.destination='https://example.invalid/other',
    s=>s.release.private_context.attestation_reference='urn:uuid:10000000-0000-4000-8000-000000000888',
    s=>s.release.outputs[0].artifact.artifact_uri='https://example.invalid/moved'
  ]) {
    const s=structuredClone(base);mutate(s);schemaValid(s);assert.throws(()=>verifyScenario(s,foundation),/LINEAGE/);
  }
});
test('protected intermediate digests are withheld without inventing public transformations', () => {
  const s=structuredClone(base), hidden=sha('SYNTHETIC-PROTECTED-SENTINEL');s.protected_sentinels.push(hidden);
  s.result.execution.transformations.unshift({step_id:'protected-intermediate',input_digests:[identity(s.production).sha256],output_digests:[hidden],private_inputs_withheld:false,private_outputs_withheld:false});
  s.release.execution.transformations.unshift({step_id:'protected-intermediate',input_digests:[],output_digests:[],private_inputs_withheld:true,private_outputs_withheld:true});
  rebind(s);schemaValid(s);verifyScenario(s,foundation);
  s.release.execution.transformations[0].output_digests=[hidden];rebind(s);schemaValid(s);assert.throws(()=>verifyScenario(s,foundation),/TRANSFORMATION_LINK/);
});
