# RFC 0012: Versioned no-output failed build results

- Status: Draft; compatibility proposal; contract-owner decision pending
- Authors: Codex draft for Studio O02/O03
- Created: 2026-10-29
- Contract family: Comic Manifest build results and bounded build-attempt lifecycle
- Compatibility: Proposed new exact Comic Manifest version; version and schema ID undecided
- Supersedes: None
- Superseded by: None
- Constitution version: 1.0.0
- Constitution tag: `constitution/v1.0.0`
- Constitution commit: `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Applicable checklist profile: RFC and stable specification
- Conformance evidence: [Studio issue #103](https://github.com/DefinitelySecureStudio/studio/issues/103), [Studio issue #104](https://github.com/DefinitelySecureStudio/studio/issues/104), and finite synthetic fixtures proposed below
- Decision owner and required A4 reviewers: `@andrewperis`; Codex and Platform maintainers

## Summary

This draft proposes one narrowly versioned `comic-build-result` representation
for a known failed attempt that produced no output. It is intended to preserve
the terminal, schema-validated result prerequisite in [RFC 0010](0010-build-attempt-lifecycle.md)
and safely support the explicitly authorized retry case in [RFC 0011](0011-job-limits-and-recovery.md).
It changes no schema or runtime behavior in this PR, selects no final contract
version, and does not accept a normative contract.

Comic Manifest 1.0.0 is already published and immutable at both Codex and
Platform: Codex [tag `contract/comic-manifest/v1.0.0`](https://github.com/DefinitelySecureStudio/codex/releases/tag/contract/comic-manifest/v1.0.0)
points to [source commit `12e437e30328a3bb9cd2d15e6307a70b4b7e0e2a](https://github.com/DefinitelySecureStudio/codex/commit/12e437e30328a3bb9cd2d15e6307a70b4b7e0e2a),
and Platform publishes the immutable [`comic-manifest/v1.0.0` consumer release](https://github.com/DefinitelySecureStudio/platform/releases/tag/comic-manifest/v1.0.0).
Their artifacts remain unchanged. The proposal requires a new exact version and
coordinated consumer support if accepted. Timeout mapping and ambiguous
result-integrity handling remain deferred under RFC 0010.

## Motivation and existing behavior

The released [Comic Manifest v1.0.0 schema](../schemas/json/comic-manifest/v1/comic-manifest.schema.json)
allows a `failed` result with an empty top-level `outputs` list and an existing
diagnostic such as `OUTPUT_MISSING`. It also requires at least one execution
transformation. The transformation schema permits empty `output_digests`, but
the released Platform consumer's internal-result semantics currently requires
both input and output digests for each transformation and rejects withheld
flags. See [Platform's v1.0.0 semantics](https://github.com/DefinitelySecureStudio/platform/blob/f66b755b797aa5d5b4dee5f7da9f6995c3e98f75/src/comic-manifest/semantics.js#L53-L60).
Thus an empty `outputs` list can pass structural validation while a truthful
transformation record for a provider call that returned no output fails
consumer semantic validation. Substituting a fabricated digest or setting
`private_outputs_withheld: true` would misstate evidence and is not permitted.

Platform PR [#53](https://github.com/DefinitelySecureStudio/platform/pull/53)
keeps retry blocked until a terminal validated result can be represented; its
merged change does not bypass this boundary. RFC 0011 permits at most one
explicit retry only after a terminal, fully reconciled `failed` result and
protected evidence that a rate-limit request was rejected before acceptance or
action with no output. This proposal makes that known failure representable
without weakening the meaning of successful or partial results.

## Proposed representation

For a new, owner-selected Comic Manifest version, a no-output failure result
MUST satisfy all of these conditions:

1. `kind` remains `comic-build-result`; the record uses the exact `spec_version`
   and schema ID selected for the new version. The 1.0.0 schema and its accepted
   meaning remain unchanged.
2. `status` is `failed`, `outputs` is exactly `[]`, and `diagnostics` contains
   the existing diagnostic that matches the recorded outcome. No new status,
   field, or diagnostic is introduced by this proposal.
3. The result preserves the exact pinned production reference, actual manifest
   inputs, distinct `attempt_id` and `result_id`, execution metadata, and
   applicable gates required by the chosen version. Its execution contains
   exactly one transformation for this bounded one-call path. That entry has
   one or more verified `input_digests`, `output_digests: []`,
   `private_inputs_withheld: false`, and `private_outputs_withheld: false`.
   Digests describe bytes actually consumed or produced; none may be invented.
4. An empty digest list means the transformation produced no output. It MUST
   NOT be used to hide an output that exists but is unverified, discarded,
   omitted, or inaccessible. If output existence or identity is uncertain, the
   result is blocked for reconciliation and this representation is not valid.
5. `complete` keeps its existing requirements, including at least one verified
   output and no diagnostics. `partial` continues to require verified retained
   outputs and a safe applicable diagnostic. Neither may use this no-output
   form. A known no-output failure uses `failed`; `failed` does not make an
   attempt release-eligible.

### Outcome and diagnostic mapping

The proposed no-output form uses existing diagnostics only. The underlying
Provider Execution outcome remains in the protected attempt index; private
provider details, retry timing, request IDs, and error text MUST NOT be copied
into the Manifest result.

| Confirmed outcome | Proposed Comic Manifest result | Retry effect |
|---|---|---|
| Rate limit that positively proves rejection before acceptance/action and no output | `failed`, `OUTPUT_MISSING`, no outputs, one truthful empty-output transformation | Eligible for consideration only after immutable result readback and terminal-link confirmation, with all RFC 0011 conditions and a separate explicit caller retry. |
| Normalized cancellation after dispatch, with confirmed no output | `failed`, `CANCELLED`, no outputs, only if the selected version retains RFC 0010's existing cancellation mapping | Never rate-limit eligible; no retry. Cancellation before dispatch produces no provider call and no Comic Manifest result. |
| Output-validation failure where provider bytes exist and their digests are verified | Keep actual output digests in the transformation and use RFC 0010's existing `failed` + `VALIDATION_FAILED` mapping where applicable. This is not the no-output form even if no valid Manifest rendition is retained. | Not retryable under RFC 0011. |
| Validation failure with missing normalized content or unknown provider-byte presence | Preserve the protected outcome; do not infer no bytes from an empty normalized output. Remain `contract-mapping-blocked` until a separate policy and evidence establish a valid mapping. | No retry. |
| Failure where an output exists, has been produced, or its existence/integrity is uncertain | Do not use the no-output form. Apply an already supported mapping only when its actual evidence satisfies that mapping; otherwise preserve protected evidence and block for reconciliation. | Not eligible under the rate-limit rule. |
| Provider Execution `timed-out`, ambiguous dispatch, or uncertain persistence | Keep the exact protected outcome and `contract-mapping-blocked` or reconciliation-required host state. Emit no Comic Manifest terminal result under this proposal. | No retry. Timeout and integrity mappings remain deferred. |

`OUTPUT_MISSING` is a result diagnostic, not proof of rate limiting. Retry
eligibility MUST come from a separate protected, immutable Provider Execution
outcome linked to the exact `attempt_id` and `execution_id`. For the RFC 0011
rate-limit case, that record must establish category `rate-limit`,
`retryable: true`, a finite `retry_after_ms`, and safe detail
`RATE_LIMITED_BEFORE_ACCEPTANCE` proving rejection before acceptance/action and
no output. The caller must wait at least the stated delay and explicitly
authorize the retry. The original production identity and bytes, remaining
deadline and material budget, attempt ceiling, and all prior immutable records
must still verify. The retry uses fresh attempt, execution, and result IDs and
links `retry_of_attempt_id`; no automatic retry is allowed.

The terminal-result prerequisite from RFC 0010 remains exact: the immutable
result bytes must be written once, read back and verified against the frozen
size/digest, and linked by a confirmed terminal index entry. A prepared result,
an ambiguous write, or a protected rate-limit outcome without the terminal
result is not retry-authorizing. Do not overwrite, replay, allocate replacement
IDs, or infer success/absence from an uncertain write.

## Compatibility and migration

Comic Manifest 1.0.0 is immutable. This proposal MUST NOT edit, replace, or
republish its schema, specification, bundle, fixtures, tag, or consumer release.
If accepted, the new representation requires a new versioned schema and fixture
set, a distinct schema ID, coordinated Codex and Platform implementation, and
explicit exact-version negotiation. A 1.0.0 consumer continues to reject an
unsupported version; it must not coerce, ignore, downgrade, or silently reinterpret
the result. A consumer that does not advertise support for the exact selected
version must fail closed before use.

The versioning policy requires versioned schema identity and exact support
negotiation for changes to accepted meaning. The recommendation for owner review
is to evaluate a new minor version (for example, 1.1.0) if compatibility review
classifies this as an additive valid representation; if that review finds the
change incompatible, select a new major version instead. This RFC does not
assign a version string, schema URI, support window, release date, or final
compatibility classification.

Existing records are never rewritten or relabeled. A historical attempt may be
represented under a later version only through a separately reviewed migration
that has the exact original production revision, actual transformation inputs,
the immutable protected provider outcome, and evidence that no output was
produced. Missing evidence remains blocked; no data is inferred from a blank
output list. Rollback selects an explicitly supported immutable version and
does not authorize replay or restore revoked authority.

If the proposal is accepted, the review sequence is: choose exact version and
schema identity; add versioned schema/specification and side-by-side positive
and negative fixtures; update Platform's exact-version validator and semantic
checks; run Codex and Platform conformance at the reviewed heads; record a
separate consumer adoption decision; and seek separate release approval. None
of those implementation, adoption, or release steps is authorized by this
draft PR.

## Cancellation, timeout, and integrity boundaries

Cancellation before confirmed dispatch prevents the provider call and creates no
Comic Manifest result. During a dispatched call, preserve the actual normalized
outcome. A confirmed no-output `cancelled` outcome may use `failed` plus
`CANCELLED` only under the explicitly selected O02 mapping; cancellation never
becomes a rate-limit outcome and never permits retry. A late success remains a
success with its actual verified outputs; cancellation does not relabel it.
After restart, recovery is read-only by default and requires the authorization
rules in RFC 0011 for any permitted transition.

Timeout remains deliberately unmapped. A `timed-out` Provider Execution result
stays protected and `contract-mapping-blocked`; this proposal adds no `TIMEOUT`
diagnostic and no terminal result or retry. Ambiguous result writes/readbacks,
terminal links, output integrity, and restart reconciliation retain the exact
fail-closed rules of RFCs 0010 and 0011. This proposal does not decide how to
make those cases terminal.

## Synthetic fixture expectations

These are proposed expectations, not executed tests or claims of conformance.

### Positive fixtures

1. **No-output rate limit:** exact synthetic production inputs are pinned;
   one mock Provider Execution call returns a normalized rate-limit outcome;
   the protected outcome proves rejection before acceptance/action, no output,
   `retryable: true`, and finite `retry_after_ms`. The new-version result is
   `failed` + `OUTPUT_MISSING`, has `outputs: []`, one actual transformation
   with nonempty input digests and empty output digests, and both withheld flags
   false. It becomes terminal only after immutable readback and terminal-link
   confirmation. After the delay and explicit caller authorization, one retry
   uses fresh IDs, links the old attempt, preserves the pinned production bytes
   and old records, and stays within original budgets.
2. **Validation failure with actual provider bytes:** preserve verified digests
   of those bytes in the transformation when using RFC 0010's existing
   `failed` + `VALIDATION_FAILED` mapping. Do not mark the transformation as
   empty-output. If normalized content is missing and provider-byte presence
   cannot be established, remain blocked without a terminal result.
3. **Cancellation:** pre-dispatch cancellation makes no call and emits no
   result. A dispatched mock that returns confirmed `cancelled` with no output
   can use `failed` + `CANCELLED` only when that existing mapping is in the
   selected version; it never qualifies for retry. A successful response that
   races cancellation preserves its verified outputs and success.
4. **Version compatibility:** the exact new version validates only when
   explicitly supported. The released 1.0.0 fixture corpus and validation
   behavior remain unchanged; a 1.0.0 consumer rejects the new exact version.

### Negative fixtures

- Reject the no-output form if status is `complete` or `partial`, if outputs are
  nonempty, if the transformation list is empty or has more than one step in
  this bounded path, or if the diagnostic is absent or outside the explicitly
  mapped allowlist.
- Reject `VALIDATION_FAILED` with an empty transformation output-digest list
  under this proposal. An empty normalized output is not proof that provider
  bytes were absent. Preserve and digest any actual bytes when the existing
  validation-failure mapping applies; otherwise block for a separate policy
  and verified evidence.
- Reject empty or fabricated input digests, nonempty output digests,
  `private_inputs_withheld: true`, or `private_outputs_withheld: true` for this
  form. Do not treat withheld or unknown output as no output.
- Reject retry if `OUTPUT_MISSING` exists without the linked protected outcome,
  or if the outcome lacks rate-limit category, `retryable: true`, a finite
  `retry_after_ms`, safe no-action proof, explicit caller authorization, elapsed
  delay, unchanged pinned inputs, positive original budgets, or a confirmed
  terminal result. Reject retry for validation failure, cancellation, timeout,
  changed revision, exhausted limits, or ambiguous call/write.
- Reject timeout-to-result coercion, auto-finalization after restart, duplicate
  execution, hidden retry, result overwrite/replay, substitute identities, or
  changed manifest bytes.
- Reject any attempt to use the new shape to suppress a produced output, an
  unverified output, or evidence of ambiguous output existence. Preserve the
  host outcome and require reconciliation instead.

## Security, privacy, and provenance

All fixtures are synthetic. Provider detail and retry proof remain protected
under the existing attempt-index classification and exact execution identity.
The Manifest result contains only existing safe diagnostic enums and actual
verified identities. Do not include provider response bodies, prompt/source
content, credentials, private record IDs, store locations, request IDs, or
private planning material. Schema validation and a terminal result establish
neither authority, rights, output quality, nor publication eligibility.

## Alternatives considered

### Keep a host-only terminal no-result failure

A protected host index could record a terminal no-output failure and permit a
retry without changing Comic Manifest. This avoids new schema and consumer
support. It is not preferred because it replaces RFC 0010's terminal validated
result prerequisite with a second terminal contract understood only by host
code, leaving cross-consumer validation and result history split. If chosen, it
needs a separate reviewed host-lifecycle contract and explicit O02/O03 change;
it must not be introduced as a local shortcut.

### Reuse Comic Manifest 1.0.0 with a false output digest or withheld flag

Rejected. A made-up digest is not observed provenance, and a withheld flag says
evidence was intentionally omitted rather than that no output exists. Neither
preserves the 1.0.0 contract meaning.

### Automatically retry from the provider outcome alone

Rejected. The protected rate-limit outcome is necessary evidence but does not
replace the terminal validated result, explicit caller authorization, elapsed
retry delay, unchanged revision, or remaining budgets required by RFC 0011.

## Unresolved owner decisions

1. Accept or reject a new versioned Comic Manifest representation for the
   narrowly defined no-output failure shape.
2. Confirm whether the existing no-output `CANCELLED` mapping is included in
   that version, or restrict the new form to `OUTPUT_MISSING`. This proposal
   excludes `VALIDATION_FAILED` with empty output digests; a future change would
   need a separate policy that proves provider bytes were absent.
3. After cross-consumer compatibility review, select a minor or major version
   and exact schema ID. The RFC recommends evaluating a minor version first
   only if the change is classified as additive; no version is selected here.
4. Decide whether to authorize the separate implementation, adoption, and
   release steps after the specification and conformance evidence are reviewed.

Acceptance of this RFC would be a contract-design decision only to the extent
explicitly recorded. It would not itself authorize implementation, release,
production execution, real providers, private-source use, retries, publication,
or changes to deferred timeout/integrity semantics.
