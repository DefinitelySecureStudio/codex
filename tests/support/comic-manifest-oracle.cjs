// Test-only relational oracle for public synthetic scenarios, not a runtime
// parser, authorization verifier, projection implementation or trust root.
const assert = require('node:assert/strict');
const { canonical, identity, sha } = require('./context-builder-oracle.cjs');
const eq = (a, b, code) => assert.deepEqual(a, b, code);
const check = (v, code) => assert.ok(v, code);
const unique = (xs, code) => eq(new Set(xs).size, xs.length, code);
const rank = c => ['public', 'internal', 'confidential', 'restricted'].indexOf(c);
const gates = ['editorial', 'canon-continuity', 'visual-text', 'integrity', 'provenance', 'security-privacy', 'rights', 'accessibility', 'packaging'];
function parseUtcInstant(value) {
  if (typeof value !== 'string' || value.length > 32) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})[Tt\s](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?Z$/.exec(value);
  if (!match) return null;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fraction] = match;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  const hour = Number(hourText), minute = Number(minuteText);
  const second = Number(`${secondText}${fraction ? `.${fraction}` : ''}`);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [0, 31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > days[month]) return null;
  if (hour > 23 || minute > 59 || !(second < 60 || (hour === 23 && minute === 59 && second < 61))) return null;
  return {
    wholeSecond: `${yearText}-${monthText}-${dayText}T${hourText}:${minuteText}:${secondText}`,
    fraction: fraction ?? ''
  };
}
function compareUtcInstants(left, right) {
  const a = parseUtcInstant(left), b = parseUtcInstant(right);
  check(a && b, 'APPROVAL_TIME');
  if (a.wholeSecond !== b.wholeSecond) return a.wholeSecond < b.wholeSecond ? -1 : 1;
  const width = Math.max(a.fraction.length, b.fraction.length);
  const af = a.fraction.padEnd(width, '0'), bf = b.fraction.padEnd(width, '0');
  return af < bf ? -1 : af > bf ? 1 : 0;
}
const renditionProfiles = {
  'comic-page-image@1.0.0': { media: ['image/png', 'image/jpeg', 'image/webp'], maxBytes: 50_000_000, image: true },
  'comic-portable-document@1.0.0': { media: ['application/pdf'], maxBytes: 50_000_000, image: false },
  'comic-accessible-transcript@1.0.0': { media: ['text/plain'], maxBytes: 131_072, image: false }
};
function verifyRenditionProfile(r) {
  const profile = renditionProfiles[`${r.profile.profile_id}@${r.profile.profile_version}`];
  check(profile, 'RENDITION_PROFILE');
  const mediaType = r.artifact ? r.artifact.media_type : r.media_type;
  check(profile.media.includes(mediaType), 'RENDITION_MEDIA');
  if (profile.image) {
    check(r.dimensions !== null && r.dimensions.width <= 8_192 && r.dimensions.height <= 8_192 &&
      r.dimensions.width * r.dimensions.height <= 33_554_432, 'RENDITION_DIMENSIONS');
  } else eq(r.dimensions, null, 'RENDITION_DIMENSIONS');
  check(r.max_bytes <= profile.maxBytes, 'RENDITION_LIMIT');
  if (r.artifact) check(r.artifact.byte_size <= r.max_bytes, 'OUTPUT_LIMIT');
}
const productionRef = p => ({ production_id: p.production_id, revision: p.revision, identity: identity(p) });
function verifyProduction(p) {
  eq(p.previous === null, p.revision === 1, 'REVISION');
  if (p.previous) { eq(p.previous.production_id, p.production_id, 'REVISION'); eq(p.previous.revision + 1, p.revision, 'REVISION'); }
  unique(p.panels.map(x => x.panel_id), 'PANEL_ID');
  unique(p.panels.flatMap(x => x.text.map(t => t.text_id)), 'TEXT_ID');
  unique(p.inputs.assets.map(x => x.asset_id), 'ASSET_ID');
  unique(p.inputs.prompts.map(x => x.binding_id), 'PROMPT_ID');
  unique(p.renditions.map(x => x.rendition_id), 'RENDITION_ID');
  for (const panel of p.panels) {
    unique(panel.asset_ids, 'ASSET_ID'); unique(panel.prompt_bindings, 'PROMPT_ID');
    check(panel.asset_ids.every(id => p.inputs.assets.some(a => a.asset_id === id)), 'ASSET_LINK');
    check(panel.prompt_bindings.every(id => p.inputs.prompts.some(a => a.binding_id === id)), 'PROMPT_LINK');
    for (const t of panel.text) eq(t.speaker === null, t.kind === 'caption', 'SPEAKER');
  }
  for (const a of p.inputs.assets) {
    check(rank(p.classification) >= rank(a.classification), 'CLASSIFICATION');
    if (a.reference.kind === 'public') eq(a.classification, 'public', 'CLASSIFICATION');
  }
  for (const b of p.inputs.prompts) if (b.context) {
    check(rank(p.classification) >= rank(b.context.classification), 'CLASSIFICATION');
    unique(b.context.sections, 'CONTEXT_SECTIONS');
  }
  for (const r of p.renditions) {
    verifyRenditionProfile(r);
    eq(r.media_type.startsWith('image/'), r.dimensions !== null, 'DIMENSIONS');
  }
  check(p.renditions.some(r => r.required), 'REQUIRED_OUTPUT');
}
function verifyResult(p, r, bytes) {
  eq(r.production, productionRef(p), 'PRODUCTION_LINK'); eq(r.inputs, p.inputs, 'INPUT_LINK');
  check(rank(r.classification) >= rank(p.classification), 'CLASSIFICATION');
  unique(r.outputs.map(x => x.rendition_id), 'OUTPUT_ID'); unique(r.gates.map(x => x.gate), 'GATE_ID');
  check(Date.parse(r.execution.started_at) <= Date.parse(r.execution.finished_at), 'TIME');
  check(p.inputs.dependencies.some(d=>canonical(d)===canonical(r.execution.tool)),'TOOL_LINK');
  unique(r.execution.transformations.map(t=>t.step_id),'TRANSFORMATION_ID');
  for(const t of r.execution.transformations) { check(t.input_digests.length>0 && t.output_digests.length>0,'TRANSFORMATION_INPUT');eq(t.private_inputs_withheld,false,'TRANSFORMATION_INPUT');eq(t.private_outputs_withheld,false,'TRANSFORMATION_INPUT'); }
  for(const g of r.execution.generation) unique(g.parameters.map(p=>p.name),'PARAMETER_ID');
  for (const out of r.outputs) {
    const req = p.renditions.find(x => x.rendition_id === out.rendition_id); check(req, 'UNEXPECTED_OUTPUT');
    eq(out.profile, req.profile, 'OUTPUT_REQUIREMENT'); eq(out.max_bytes, req.max_bytes, 'OUTPUT_REQUIREMENT');
    verifyRenditionProfile(out);
    eq(out.artifact.media_type, req.media_type, 'MEDIA'); eq(out.dimensions, req.dimensions, 'DIMENSIONS');
    for (const key of ['alt_text', 'transcript', 'rights_notice']) eq(out[key], req[key], 'OUTPUT_REQUIREMENT');
    const raw = bytes[out.rendition_id]; check(typeof raw === 'string', 'MISSING_BYTES');
    eq(out.artifact.byte_size, Buffer.byteLength(raw), 'OUTPUT_SIZE'); eq(out.artifact.sha256, sha(raw), 'OUTPUT_DIGEST');
  }
  if (r.status === 'complete') {
    eq(r.diagnostics, [], 'COMPLETE_DIAGNOSTICS');
    check(p.renditions.filter(x => x.required).every(req => r.outputs.some(out => out.rendition_id === req.rendition_id)), 'REQUIRED_OUTPUT');
  } else check(r.diagnostics.length > 0, 'FAILURE_DIAGNOSTIC');
}
function verifyFoundation(p, foundation) {
  for (const b of p.inputs.prompts) {
    eq(b.identity, identity(foundation.prompt), 'PROMPT_IDENTITY');
    eq(b.prompt_id, foundation.prompt.id, 'PROMPT_IDENTITY'); eq(b.prompt_version, foundation.prompt.version, 'PROMPT_IDENTITY');
    if (!b.context) continue;
    const c = b.context, pkg = foundation.result.package;
    eq(c.instance_id, pkg.manifest.package.instance_id, 'PACKAGE_LINK');
    eq(c.package_id, pkg.manifest.package.id, 'PACKAGE_LINK'); eq(c.package_version, pkg.manifest.package.version, 'PACKAGE_LINK');
    eq(c.manifest_identity, identity(pkg.manifest), 'PACKAGE_LINK');
    eq(c.builder_result_identity, identity(foundation.result), 'BUILDER_LINK');
    eq(c.classification, pkg.manifest.classification, 'CLASSIFICATION');
    eq(c.purpose, pkg.manifest.purpose, 'CONTEXT_PURPOSE'); eq(c.sections, pkg.manifest.sections.map(x => x.slot), 'CONTEXT_SECTIONS');
    eq(c.preparation_reference, foundation.request.preparation_reference, 'PREPARATION_LINK');
    eq(c.use_authorization_reference, foundation.authorization.decision_id, 'USE_LINK');
  }
}
function verifyApproval(a, subject, artifacts, scope, s) {
  eq(a.subject, identity(subject), 'APPROVAL_SUBJECT');
  eq(a.artifact_digests, artifacts.map(x => x.artifact.sha256).sort(), 'APPROVAL_ARTIFACTS');
  eq(a.scope, scope, 'APPROVAL_SCOPE');
  // Validate trusted action time before comparing arbitrary schema-valid fractions.
  check(compareUtcInstants(a.decided_at, s.at) <= 0 && compareUtcInstants(s.at, a.expires_at) < 0 &&
    compareUtcInstants(scope.publication_time, a.expires_at) < 0, 'APPROVAL_TIME');
  // A test harness supplies trusted decisions OUTSIDE untrusted record bytes.
  const trusted = s.trust.approvals.find(x => x.decision_id === a.decision_id);
  check(trusted && trusted.sha256 === identity(a).sha256 && !s.trust.revoked.includes(a.decision_id), 'APPROVAL_TRUST');
}
function verifyScenario(s, foundation) {
  const p = s.production, r = s.result, rel = s.release;
  verifyProduction(p); verifyResult(p, r, s.output_bytes); verifyFoundation(p, foundation);
  for (const d of [p.inputs.canon, ...p.inputs.dependencies, ...p.inputs.prompts.map(b => b.definition),
    ...p.inputs.assets.filter(a => a.reference.kind === 'public').map(a => a.reference.dependency)]) {
    check(!['main', 'master', 'latest'].includes(d.tag), 'FLOATING_REFERENCE');
    const bytes = s.dependency_bytes[d.artifact.artifact_uri]; check(typeof bytes === 'string', 'DEPENDENCY_MISSING');
    eq(Buffer.byteLength(bytes), d.artifact.byte_size, 'DEPENDENCY_SIZE'); eq(sha(bytes), d.artifact.sha256, 'DEPENDENCY_DIGEST');
  }
  eq(r.status, 'complete', 'RESULT_NOT_COMPLETE');
  eq(s.linkage.production, productionRef(p), 'LINEAGE'); eq(s.linkage.result_identity, identity(r), 'LINEAGE');
  eq(s.linkage.release_identity, identity(rel), 'LINEAGE');
  eq(rel.input_canon, p.inputs.canon, 'CANON_INPUT');
  const publicDeps = [...p.inputs.dependencies, ...p.inputs.prompts.map(b=>b.definition), ...p.inputs.assets.filter(a=>a.reference.kind==='public').map(a=>a.reference.dependency)];
  eq(rel.dependencies, [...new Map(publicDeps.map(d=>[canonical(d),d])).values()], 'DEPENDENCY_LINK');
  eq(rel.title, p.title, 'TITLE'); check(rel.title !== 'Untitled', 'FINAL_TITLE');
  eq(rel.previous === null, rel.revision === 1, 'RELEASE_REVISION');
  if (rel.previous) { eq(rel.previous.episode_id, rel.episode_id, 'EPISODE_ID'); eq(rel.previous.revision + 1, rel.revision, 'RELEASE_REVISION'); check(rel.previous.release_id !== rel.release_id, 'RELEASE_REVISION'); }
  unique(rel.outputs.map(x => x.rendition_id), 'OUTPUT_ID');
  eq(rel.outputs.map(x => x.rendition_id), r.outputs.map(x => x.rendition_id), 'RELEASE_OUTPUTS');
  for (let i=0; i<rel.outputs.length; i++) {
    const {artifact: pa, ...pm} = rel.outputs[i], {artifact: ra, ...rm} = r.outputs[i]; eq(pm, rm, 'RELEASE_OUTPUTS');
    verifyRenditionProfile(rel.outputs[i]);
    eq({ ...pa, artifact_uri: ra.artifact_uri }, ra, 'RELEASE_OUTPUTS');
  }
  eq(rel.execution.tool, r.execution.tool, 'TOOL_LINK');
  for (const field of ['workflow_id','started_at','finished_at','reproducibility']) eq(rel.execution[field],r.execution[field],'EXECUTION_LINK');
  const publicDigests = new Set([rel.input_canon.artifact.sha256,...rel.dependencies.map(d=>d.artifact.sha256),...rel.outputs.map(o=>o.artifact.sha256)]);
  eq(rel.execution.transformations.length,r.execution.transformations.length,'TRANSFORMATION_LINK');
  for (let i=0;i<rel.execution.transformations.length;i++) {
    const a=r.execution.transformations[i], b=rel.execution.transformations[i];
    eq(a.step_id,b.step_id,'TRANSFORMATION_LINK');eq(b.output_digests,a.output_digests.filter(d=>publicDigests.has(d)),'TRANSFORMATION_LINK');eq(b.private_outputs_withheld,b.output_digests.length!==a.output_digests.length,'TRANSFORMATION_LINK');
    eq(b.input_digests,a.input_digests.filter(d=>publicDigests.has(d)),'TRANSFORMATION_LINK');
    eq(b.private_inputs_withheld,b.input_digests.length!==a.input_digests.length,'TRANSFORMATION_LINK');
  }
  eq(rel.gates.map(x => x.gate), gates, 'GATES');
  check(rel.gates.every(x => ['pass', 'not-applicable'].includes(x.disposition)), 'GATE_FAILED');
  for (const g of rel.gates) if (g.disposition === 'not-applicable') check(s.trust.not_applicable.includes(g.gate), 'GATE_NA');
  eq(s.trust.assignment, { production_id: p.production_id, episode_id: rel.episode_id }, 'ASSIGNMENT');
  const privateUsed = (foundation.result.package.manifest.sources.some(x => x.kind === 'approved-private') && p.inputs.prompts.some(x => x.context)) || p.inputs.assets.some(x => x.reference.kind === 'protected');
  eq(rel.private_context.influenced, privateUsed, 'PRIVATE_INFLUENCE');
  if (privateUsed) {
    eq(s.linkage.attestation_reference, rel.private_context.attestation_reference, 'ATTESTATION');
    eq(s.trust.attestation, { reference: rel.private_context.attestation_reference, linkage_identity: identity(s.linkage) }, 'ATTESTATION_TRUST');
  }
  const prodApproval = s.approvals.filter(x => x.role === 'production-reviewer'); eq(prodApproval.length, 1, 'PRODUCTION_REVIEW');
  verifyApproval(prodApproval[0], p, [], rel.scope, s);
  unique(s.approvals.map(x => x.decision_id), 'APPROVAL_ID'); unique(rel.approvers.map(x => x.decision_id), 'APPROVAL_ID');
  const releaseApprovals = s.approvals.filter(x => x.role !== 'production-reviewer');
  eq(rel.approvers, releaseApprovals.map(({decision_id,role,actor,decided_at}) => ({decision_id,role,actor,decided_at})), 'PUBLIC_APPROVER');
  for (const role of ['publisher','canon-editor', ...(privateUsed ? ['disclosure-reviewer'] : [])]) check(releaseApprovals.some(a => a.role === role), 'APPROVAL_ROLE');
  for (const a of releaseApprovals) verifyApproval(a, rel, rel.outputs, rel.scope, s);
  // Sentinel/identity checks demonstrate the boundary; they cannot prove prose
  // is reader-safe. Trusted human disclosure review remains mandatory.
  const publicText = JSON.stringify(rel);
  for (const secret of [p.production_id, identity(p).sha256, r.result_id, r.attempt_id, identity(r).sha256,
    ...p.inputs.prompts.flatMap(b => b.context ? [b.context.instance_id,b.context.manifest_identity.sha256,b.context.builder_result_identity.sha256,b.context.preparation_reference,b.context.use_authorization_reference] : []),
    ...s.protected_sentinels]) check(!publicText.includes(secret), 'PRIVATE_LEAK');
}
module.exports = { verifyProduction, verifyResult, verifyFoundation, verifyScenario, productionRef, gates, canonical, identity, sha };
