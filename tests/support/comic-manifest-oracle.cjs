// Test-only relational oracle for public synthetic scenarios, not a runtime
// parser, authorization verifier, projection implementation or trust root.
const assert = require('node:assert/strict');
const { canonical, identity, sha } = require('./context-builder-oracle.cjs');
const eq = (a, b, code) => assert.deepEqual(a, b, code);
const check = (v, code) => assert.ok(v, code);
const unique = (xs, code) => eq(new Set(xs).size, xs.length, code);
const rank = c => ['public', 'internal', 'confidential', 'restricted'].indexOf(c);
const gates = ['editorial', 'canon-continuity', 'visual-text', 'integrity', 'provenance', 'security-privacy', 'rights', 'accessibility', 'packaging'];
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
  for (const r of p.renditions) eq(r.media_type.startsWith('image/'), r.dimensions !== null, 'DIMENSIONS');
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
  const at = Date.parse(s.at);
  check(Date.parse(a.decided_at) <= at && at < Date.parse(a.expires_at) && Date.parse(scope.publication_time) < Date.parse(a.expires_at), 'APPROVAL_TIME');
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
