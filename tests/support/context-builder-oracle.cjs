// Test-only fixture oracle. Not a production parser, source reader or trust verifier.
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const rank = x => ['public', 'internal', 'confidential', 'restricted'].indexOf(x);
const canonical = x => Array.isArray(x) ? `[${x.map(canonical).join(',')}]`
  : x && typeof x === 'object' ? `{${Object.keys(x).sort().map(k => `${JSON.stringify(k)}:${canonical(x[k])}`).join(',')}}`
    : JSON.stringify(x);
const sha = x => 'sha256:' + createHash('sha256').update(x).digest('hex');
const identity = x => ({ canonicalization: 'studio-json-v1', byte_size: Buffer.byteLength(canonical(x)), sha256: sha(canonical(x)) });
const bytes = (media, content) => Buffer.from(media === 'text/plain' ? content : canonical(content));
const eq = (a, b) => assert.deepEqual(a, b);
const check = (condition, code) => assert.ok(condition, code);
const sortedUnique = xs => eq(xs, [...new Set(xs)].sort());
const key = x => `${x.source_id}/${x.candidate_id}`;
const tokens = text => new Set((text.match(/[A-Za-z0-9]+/g) ?? []).map(x => x.toLowerCase()));
const diagnosticRules = {
  INVALID_REQUEST: [['request'], 'repair-request'], UNSUPPORTED_VERSION: [['request'], 'repair-request'],
  PREPARATION_DENIED: [['authorization'], 'obtain-authorization'], AUTHORITY_UNVERIFIABLE: [['authorization'], 'obtain-authorization'],
  SOURCE_UNAVAILABLE: [['source'], 'repair-source'], SOURCE_INTEGRITY: [['source'], 'repair-source'],
  INVALID_SOURCE: [['normalization'], 'repair-source'], CONFLICT: [['selection'], 'resolve-conflict'],
  INELIGIBLE: [['selection'], 'repair-request'],
  REQUIRED_CONTEXT_MISSING: [['assembly'], 'repair-request'], BUDGET_EXCEEDED: [['source', 'normalization', 'assembly'], 'increase-budget'],
  STALE_AUTHORITY: [['authorization', 'lifecycle', 'handoff'], 'rebuild'], AUDIT_REQUIRED: [['audit'], 'retry-audit']
};
function validateFailure(result, request) {
  eq(result.request_identity, identity(request)); eq(result.build_id, request.build_id); eq(result.correlation_id, request.correlation_id);
  for (const d of result.diagnostics) {
    if (d.code === 'CANCELLED') { eq(d.action, 'none'); continue; }
    const rule = diagnosticRules[d.code]; check(rule, 'terminal failure code');
    check(rule[0].includes(d.stage), 'diagnostic stage'); eq(d.action, rule[1]);
  }
}
function pointerParts(pointer) { return pointer === '' ? [] : pointer.slice(1).split('/').map(x => x.replace(/~1/g, '/').replace(/~0/g, '~')); }
function extract(raw, source, fragment) {
  if (source.media_type === 'text/plain') {
    eq(fragment.unit, 'utf8-byte-range'); check(fragment.start < fragment.end && fragment.end <= raw.length, 'fragment range');
    // Fatal decoding checks the source and both fragment boundaries.
    const decoder = new TextDecoder('utf-8', { fatal: true }); decoder.decode(raw);
    decoder.decode(raw.subarray(0, fragment.start)); decoder.decode(raw.subarray(fragment.end));
    return decoder.decode(raw.subarray(fragment.start, fragment.end));
  }
  eq(fragment.unit, 'json-pointer');
  let value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(raw));
  for (const part of pointerParts(fragment.pointer)) {
    if (Array.isArray(value)) check(/^(0|[1-9][0-9]*)$/.test(part), 'array pointer');
    check(value !== null && typeof value === 'object' && Object.hasOwn(value, part), 'missing pointer'); value = value[part];
  }
  return value;
}
function verifyScenario(s) {
  const r = s.request, result = s.result, p = s.prompt, at = Date.parse(r.evaluation_time);
  eq(r.target, { id: p.id, version: p.version, identity: identity(p) });
  check(at < Date.parse(r.review_after) && Date.parse(r.review_after) <= Date.parse(r.expires_at), 'request time');
  sortedUnique(r.sources.map(x => x.source_id)); sortedUnique(r.authority_ids);
  eq(r.slots.map(x => x.name), p.context_slots.map(x => x.name));
  eq(new Set(r.slots.map(x => x.name)).size, r.slots.length);
  const plans = r.sources.flatMap(x => x.fragments.map(f => f.candidate_id));
  eq(new Set(plans).size, plans.length); check(plans.length <= r.limits.max_candidates, 'candidate limit');
  check(s.raw_sources.reduce((n, x) => n + Buffer.byteLength(x.text), 0) <= r.limits.total_source_bytes, 'source budget');
  eq(s.normalized.length, r.sources.length);
  eq(new Set(s.normalized.map(n => n.source.source_id)).size, r.sources.length);
  const candidates = new Map();
  for (const source of r.sources) {
    sortedUnique(source.fragments.map(x => x.candidate_id));
    check(Date.parse(source.not_before) <= Date.parse(source.review_after) && Date.parse(source.review_after) <= Date.parse(source.expires_at), 'source time');
    const rawEntries = s.raw_sources.filter(x => x.source_id === source.source_id); eq(rawEntries.length, 1);
    const raw = Buffer.from(rawEntries[0].text);
    if (source.reference.kind === 'public-artifact') {
      eq(source.reference.artifact.media_type, source.media_type);
      eq(source.reference.artifact.byte_size, raw.length); eq(source.reference.artifact.sha256, sha(raw));
    }
    // Opaque reader mappings/trust are synthetic out-of-band inputs, not proven here.
    const n = s.normalized.find(n => n.source.source_id === source.source_id);
    eq(n.source, source); eq(n.build_id, r.build_id); eq(n.request_identity, identity(r));
    eq(n.candidates.map(x => x.candidate_id), source.fragments.map(x => x.candidate_id));
    for (let i = 0; i < source.fragments.length; i++) for (let j = i + 1; j < source.fragments.length; j++) {
      const a = source.fragments[i].fragment, b = source.fragments[j].fragment;
      if (a.unit === 'utf8-byte-range' && b.unit === a.unit) check(a.end <= b.start || b.end <= a.start, 'overlapping ranges');
      if (a.unit === 'json-pointer' && b.unit === a.unit) {
        const ap = pointerParts(a.pointer), bp = pointerParts(b.pointer);
        check(!ap.every((v, k) => bp[k] === v) && !bp.every((v, k) => ap[k] === v), 'overlapping pointers');
      }
    }
    for (const c of n.candidates) {
      const plan = source.fragments.find(f => f.candidate_id === c.candidate_id);
      eq(c.fragment, plan.fragment); eq(c.claim_id, plan.claim_id); eq(c.classification, source.classification);
      eq(c.content, extract(raw, source, plan.fragment));
      const b = bytes(source.media_type, c.content); eq(c.byte_size, b.length); eq(c.sha256, sha(b));
      const eligible = r.authority_ids.includes(source.authority_id) && source.continuity_id === r.continuity_id
        && Date.parse(source.not_before) <= at && at < Date.parse(source.review_after) && at < Date.parse(source.expires_at)
        && rank(source.classification) <= rank(r.max_classification);
      candidates.set(key({ source_id: source.source_id, candidate_id: c.candidate_id }), { ...c, source, eligible });
    }
  }
  const claims = new Map();
  for (const c of candidates.values()) if (c.eligible && c.claim_id) {
    const fact = `${c.source.media_type}/${c.sha256}`;
    if (claims.has(c.claim_id)) eq(claims.get(c.claim_id), fact); else claims.set(c.claim_id, fact);
  }
  const outputs = r.slots.map((slot, i) => {
    const declared = p.context_slots[i]; eq(slot.required, declared.required); eq(slot.accepted_classifications, declared.accepted_classifications);
    check(declared.accepted_media_types.includes(slot.media_type), 'slot media');
    check(declared.max_bytes === undefined || slot.max_bytes <= declared.max_bytes, 'slot budget');
    eq(slot.selection.mode, r.policy.selection);
    const eligible = c => c.eligible && c.source.media_type === slot.media_type && slot.accepted_classifications.includes(c.classification);
    let selected;
    if (slot.selection.mode === 'explicit-v1') {
      const keys = slot.selection.candidates.map(key); eq(new Set(keys).size, keys.length);
      selected = keys.map(k => { const c = candidates.get(k); check(c && eligible(c), 'ineligible explicit candidate'); return c; });
    } else {
      eq(slot.media_type, 'text/plain'); const query = tokens(slot.selection.query);
      selected = [...candidates.entries()].filter(([, c]) => eligible(c)).map(([k, c]) => {
        const ct = tokens(c.content); return { k, c, score: [...query].filter(t => ct.has(t)).length };
      }).filter(x => x.score > 0).sort((a, b) => b.score - a.score || (a.k < b.k ? -1 : a.k > b.k ? 1 : 0)).slice(0, slot.selection.max_candidates).map(x => x.c);
    }
    check(slot.media_type !== 'application/json' || selected.length <= 1, 'single JSON candidate');
    const content = slot.media_type === 'text/plain' ? selected.map(c => c.content).join('\n') : selected[0]?.content;
    const size = selected.length ? bytes(slot.media_type, content).length : 0;
    if (slot.required) check(size > 0, 'required context');
    if (slot.required) check(size <= slot.max_bytes, 'required slot budget');
    return { slot, selected, content, size };
  });
  let remaining = r.limits.total_content_bytes - outputs.filter(x => x.slot.required).reduce((n, x) => n + x.size, 0);
  check(remaining >= 0, 'required total budget'); const omissions = [];
  const included = outputs.filter(x => {
    if (x.slot.required) return true;
    const code = !x.size ? 'OPTIONAL_EMPTY' : x.size > x.slot.max_bytes || x.size > remaining ? 'OPTIONAL_BUDGET' : null;
    if (code) { omissions.push({ slot: x.slot.name, code }); return false; }
    remaining -= x.size; return true;
  });
  check(included.length > 0, 'nonempty package');
  eq(result.status, 'prepared'); eq(result.request_identity, identity(r)); eq(result.build_id, r.build_id); eq(result.correlation_id, r.correlation_id);
  eq(result.omissions, omissions);
  eq(result.lineage, included.map(x => ({ slot: x.slot.name, candidates: x.selected.map(c => ({ source_id: c.source.source_id, candidate_id: c.candidate_id })) })));
  const sections = included.map(x => ({ slot: x.slot.name, classification: x.selected.map(c => c.classification).sort((a, b) => rank(b) - rank(a))[0],
    media_type: x.slot.media_type, content: x.content, byte_size: x.size, sha256: sha(bytes(x.slot.media_type, x.content)), source_ids: [...new Set(x.selected.map(c => c.source.source_id))].sort() }));
  const sources = r.sources.filter(s => sections.some(x => x.source_ids.includes(s.source_id)));
  const earliest = xs => xs.sort()[0];
  const expires = earliest([r.expires_at, s.preparation_bounds.expires_at, ...sources.map(s => s.expires_at)]);
  const review = earliest([r.review_after, expires, s.preparation_bounds.review_after, ...sources.map(s => s.review_after)]);
  check(at < Date.parse(review), 'fresh prepared package');
  const manifest = { package: r.package, builder: r.builder, created_at: r.evaluation_time, review_after: review, expires_at: expires,
    purpose: r.purpose, authority_reference: r.preparation_reference,
    classification: sections.map(x => x.classification).sort((a, b) => rank(b) - rank(a))[0],
    total_content_bytes: sections.reduce((n, x) => n + x.byte_size, 0),
    sources: sources.map(s => ({ source_id: s.source_id, kind: s.kind, version: s.version, classification: s.classification, evidence_reference: s.evidence_reference,
      ...(s.reference.kind === 'public-artifact' ? { artifact: s.reference.artifact } : {}) })), sections };
  eq(result.package.manifest, manifest); eq(result.package.manifest_identity, identity(manifest));
}
module.exports = { verifyScenario, validateFailure, canonical, identity, sha };
