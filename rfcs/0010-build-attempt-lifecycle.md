# RFC 0010: Build attempt identity and result lifecycle

- Status: Draft; contract-owner decision pending
- Authors: Codex draft for Studio O02
- Created: 2026-10-27
- Contract families: comic manifests, execution provenance
- Compatibility: Proposed additive lifecycle semantics; no schema or release change in this draft
- Supersedes: None
- Superseded by: None
- Constitution version: 1.0.0
- Constitution tag: `constitution/v1.0.0`
- Constitution commit: `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Applicable checklist profile: RFC and stable specification
- Conformance evidence: [Studio issue #103](https://github.com/DefinitelySecureStudio/studio/issues/103); finite synthetic fixture expectations below
- Decision owner and required A4 reviewers: @andrewperis; Codex and Platform maintainers

## Summary

This draft proposes a bounded lifecycle for one build attempt against one exact
Comic Manifest production revision, using exactly one offline mock Provider
Execution call and ending in an immutable terminal result. It reuses the
existing `production` reference, `attempt_id`, `result_id`, `comic-build-result`,
execution transformation and output fields. It defines retry lineage and result
storage semantics without introducing a workflow DSL or runtime implementation.

This document is not an accepted contract. It does not amend the closed Comic
Manifest schema, change Provider Execution v1 or Execution Provenance v1, authorize
automatic retries, define production storage, or authorize production use. The
contract owner must decide the unresolved items below before any normative
contract or schema change.

## Motivation and existing-contract boundaries

The current [Comic Manifest v1 candidate](../specs/manifests/comic-manifest-v1.md#renditions-and-build-results)
already defines a `comic-build-result` with distinct `attempt_id` and `result_id`,
an exact production reference, actual inputs, status, outputs, execution
transformations and diagnostics. The closed [candidate schema](../schemas/json/comic-manifest/v1/comic-manifest.schema.json)
allows `complete`, `partial` and `failed` results and includes a `CANCELLED`
diagnostic. It does not define an attempt transition table, explicit retry
lineage, or how cancelled build attempts map to its result statuses.

[Provider Execution v1](0002-provider-execution-v1.md) defines one synchronous
provider invocation. Its `execution_id` is per invocation, and the contract
forbids hidden adapter retries. It is not a build-attempt identity.
[Execution Provenance v1](0005-execution-provenance.md) defines immutable
per-execution observer records and an identity envelope. It does not define a
whole-build attempt lifecycle. This proposal composes those existing boundaries;
it does not replace them.

## Specification (proposed)

### Bounded support

The supported fixture path is one wholly synthetic `comic-production` record at
one exact revision → exactly one offline mock Provider Execution call → one
terminal `comic-build-result`. An attempt with zero or more than one provider
call is outside this draft; a future design must decide how one attempt
associates multiple call IDs without changing caller correlation semantics. Use
the existing [Comic Manifest fixture](../fixtures/comic-manifest-v1.json) and
existing schema/conformance vocabulary. Fixture IDs, bytes, authorities and
references remain synthetic.

The exact revision is the complete existing production reference:
`production_id`, `revision`, and canonical `identity`. A matching logical ID or
revision number without the matching identity is insufficient.

`attempt_id` identifies one orchestration attempt; `result_id` identifies its
separate terminal result; Provider Execution `execution_id` identifies its one
adapter call. All three remain distinct and use their owning contract's format.
The protected attempt index associates the one `execution_id` with its
`attempt_id`; it does not reuse or overload Provider Execution's optional
`correlation_id`. Preserve any caller-supplied `correlation_id` unchanged. The
Provider Execution v1 description says that field groups related work without
changing identity, but it does not define build-attempt linkage. All identifiers
are allocated outside deterministic processing, are not content digests, and
convey no authority.

### Lifecycle and transition table

The states below are host/index lifecycle states, not values added to either
existing result schema. A state transition is not complete merely because a
result object has been constructed in memory.

| State | Event | Required record/effect | Rejection condition |
|---|---|---|---|
| No attempt | Prepare | Allocate fresh `attempt_id` and `execution_id`; bind both to the exact production reference and record `retry_of_attempt_id: null` for a first attempt. Append and confirm this `prepared` entry before any execution side effect. | Missing/mismatched production identity; reused ID; protected index unavailable; execution begins before preparation is confirmed. |
| Prepared | Execute once | Invoke exactly one Provider Execution request using the recorded `execution_id`; do not replace a caller-supplied `correlation_id` with the `attempt_id`. Wait for its single normalized result; the host state is `executing` until that result is durably recorded. | A second execution call under this attempt; hidden adapter retry; correlation value rewritten to imply attempt identity. |
| Executing | Record the returned outcome | Append and confirm a protected immutable `provider-outcome` record containing the exact normalized result and canonical byte size/digest, keyed by `execution_id`, before discarding the returned outcome or interpreting it for a Comic Manifest result. | Proceeding without a confirmed outcome record; losing the outcome before its protected record is confirmed. |
| Outcome-recorded | Successful outcome and build-result verification | Construct one candidate `comic-build-result` with a distinct `result_id`, the same `attempt_id` and exact production reference. Preserve actual inputs, ordered transformations, verified outputs, status `complete`, and no diagnostics. This is `result-prepared`, not terminal. | Missing/mismatched required input, transformation, or output identity; an unverified output treated as successful. |
| Outcome-recorded | Normalized failure or cancellation | Prepare a candidate result using existing status/diagnostic fields; transition to `result-prepared`. Proposed mapping: use `partial` only when verified outputs are retained; otherwise use `failed`. Use an applicable existing diagnostic, including `CANCELLED` for cancellation. Neither result is release-eligible. This remains nonterminal until persisted and confirmed. | Claiming `complete` with diagnostics or incomplete/unverified outputs; inventing a diagnostic or emitting unsafe diagnostic content. |
| Outcome-recorded | Provider result is `timed-out` | Append and confirm a `contract-mapping-blocked` entry keyed by `attempt_id` and `execution_id` that references the confirmed protected outcome record and exact production revision. Do not create a Comic Manifest result, retry, or auto-finalize. | Coercing timeout to `failed`/`partial`; inventing a timeout diagnostic; reporting the build attempt terminal. |
| Result-prepared | Begin terminal persistence | Freeze the candidate bytes, `result_id`, byte size, and digest. Append a `persisting` index entry for those exact bytes before submitting one immutable result write. | Changing candidate bytes/ID after `persisting`; submitting a second terminal write or changing IDs to bypass a conflict. |
| Persisting | Immutable result and terminal link are confirmed | Verify the stored bytes against the frozen size/digest, then append and confirm one terminal index entry referring to that exact result. Only after both confirmations is the attempt `terminal`. | Missing/ambiguous commit, byte mismatch, or unconfirmed terminal link; reporting terminal before both confirmations. |
| Any nonterminal state | Any required protected-index append, immutable result write/readback, or terminal-link append fails or is ambiguous | Mark the host state `reconciliation-required`; keep it nonterminal. Do not re-execute, retry a write, overwrite bytes, create another result ID, start a retry, or finalize while unresolved. Reconcile by the identifiers/digest allocated or recorded at the affected step: use `attempt_id`/`execution_id` before a result exists, then include `result_id` and its digest once allocated. Apply the same rule to an uncertain `prepared`, `provider-outcome`, `contract-mapping-blocked`, `persisting`, or `terminal` append. | Treating failure/timeout/ambiguous response as proof of absence or success; silently repeating any side effect. |
| Terminal attempt | Caller authorizes a retry | Allocate new attempt, execution, and result IDs. Set `retry_of_attempt_id` to the prior attempt ID and retain the exact same production reference. Preserve all prior entries and result bytes unchanged. Eligibility and retry limits belong to O03/caller policy. | Hidden or automatic retry; retrying a nonterminal or unreconciled attempt; changed production reference; overwriting a prior attempt/result. |
| Any attempt | Production revision changes | Start a fresh lineage with a new attempt ID and no retry link. A changed exact production reference is not a retry. | Carrying a prior result, output, or approval to the new revision. |

The `retry_of_attempt_id` relation and provider-call association are not present
in the current closed Comic Manifest schema. This draft recommends recording
them in a protected append-only attempt index, rather than adding public fields
before the contract owner's decision. The index is a logical record boundary,
not a prescribed storage API or workflow language. The owner must decide whether
this index is acceptable or whether retry lineage belongs in a future versioned
result contract. This bounded path associates exactly one `execution_id` with
each attempt. Provider Execution's `correlation_id` remains caller-owned and
unchanged; attempts containing multiple call IDs remain unsupported pending a
future association design.

The proposed index records these lifecycle references:

- A `prepared` entry: `attempt_id`, the exact `production` reference, nullable
  `retry_of_attempt_id`, and the one allocated `execution_id`.
- A `provider-outcome` entry: `execution_id`, the exact normalized Provider
  Execution v1 result bytes, and verified canonical JSON byte size/digest. Keep
  this record at the result's effective protected classification.
- A `contract-mapping-blocked` entry: `attempt_id`, `execution_id`, the exact
  production reference, and a protected reference to the matching
  `provider-outcome` entry. This records a host lifecycle state, not a new
  Provider Execution or Comic Manifest status.
- A `persisting` entry: the same `attempt_id`, result status, `result_id`, and
  frozen result byte size/digest before the immutable write.
- A `terminal` entry: the same `attempt_id`, `result_id`, and protected immutable
  result reference with its verified size/digest, appended only after the
  immutable object has been read back and verified.

Entries are append-only. A terminal entry does not update or replace earlier
entries, and the prior attempt's entries are never changed when a retry begins.
An attempt with a `persisting` entry but no confirmed `terminal` entry is
nonterminal; any failed or ambiguous lifecycle append/write requires
reconciliation before proceeding, including an uncertain `prepared` append.
For `timed-out`, the protected `provider-outcome` record makes the normalized
error recoverable by `execution_id`; the `contract-mapping-blocked` entry keeps
the attempt and exact production revision linked to it. An authorized
reconciliation can retrieve and verify these records, but this draft defines no
automatic finalization or retry. If the outcome cannot be recovered by
`execution_id`, the attempt remains unresolved and this version provides no
safe way to reconstruct it. This describes identity and linkage only; it does
not prescribe a database, queue, storage API, retention period or runtime
interface.

Storage integrity metadata is not a new field in `comic-build-result`. This draft
recommends reusing Studio canonical JSON v1 byte-size/SHA-256 semantics from
Execution Provenance for the stored result envelope while keeping the result's
existing `result_id` as its opaque record identifier. The owner must confirm this
boundary before any schema or consumer change.

An identical read of an already stored terminal result is not a new execution.
Any second terminal-result write for an already terminal attempt MUST be rejected,
including a byte-identical replay; reads of the existing stored result remain
allowed. A conflicting replay under an existing attempt or result ID MUST fail
closed, and the original bytes and lineage remain unchanged. A failed or
ambiguous write is not evidence that no commit occurred. The host MUST retain
the fixed IDs and bytes, remain nonterminal, and reconcile before any further
action; this draft authorizes no automatic repeat write, execution, or attempt.
The store's recovery/read consistency contract remains a future implementation
decision.

### Provider timeout mapping (deferred)

Provider Execution v1 can return `timed-out`. The current Comic Manifest schema
has no timeout diagnostic (its diagnostics are a closed enum) and no matching
build-result status. This draft therefore does not map a timed-out execution to
`failed` or `partial`, and does not invent a `TIMEOUT` diagnostic or add a
schema field. If the one mock call returns `timed-out`, persist its exact
normalized Provider Execution result in the protected `provider-outcome` index
entry and record the `contract-mapping-blocked` state described above. The build
attempt remains nonterminal with no Comic Manifest result until the contract
owner approves a versioned mapping and an explicitly authorized reconciliation
applies it. No automatic finalization or retry occurs. This is a deliberate
deferral, not a pass or a release disposition.

### Finite fixture expectations

These cases are proposed acceptance fixtures, not executed tests or evidence of
authorization. All use synthetic data from the existing Comic Manifest fixture.

| Case | Input | Expected evidence |
|---|---|---|
| First successful attempt | One exact production reference and one mock execution | New attempt/result IDs; result binds the same exact revision; actual input identities, ordered transformation digests and verified output identities are preserved; terminal `complete` is stored immutably. |
| One-call identity and caller correlation | One request has a caller-supplied `correlation_id` | The prepared index associates exactly one distinct `execution_id` with the `attempt_id`; the request's caller-supplied correlation value is not overwritten with the `attempt_id` and follows Provider Execution v1 semantics. A second provider call under this attempt is rejected; multi-call association is deferred. |
| Retry after terminal failure | A prior failed result and explicit caller retry authorization | New attempt/result IDs; retry link to the prior attempt; same exact production reference; prior result bytes and status remain unchanged. Retry eligibility itself is not decided here. |
| Failure without usable output | An otherwise schema-valid mock Provider Execution result for the prepared `execution_id`: `status=failed`, `finish_reason=error`, `error.category=output-validation`, `error.code=OUTPUT_SCHEMA_INVALID`, `error.message="Mock output failed the declared output schema."`, `error.retryable=false`, `error.stage=output-validation`, no output | Build result uses existing `status=failed`, `outputs=[]`, and `diagnostics=[VALIDATION_FAILED]`; no successful output or release claim. The existing Provider Execution [error taxonomy](../specs/execution-contracts/provider-execution-v1.md#normalized-error-taxonomy) defines `output-validation`; the existing [Comic Manifest schema](../schemas/json/comic-manifest/v1/comic-manifest.schema.json) defines `VALIDATION_FAILED`. |
| Cancellation with retained verified output | Cancellation after a fixture output is independently verified | Terminal `partial` result with `CANCELLED`; only the verified output is retained; result cannot support release. |
| Cancellation before usable output | Cancellation before any output is verified | Terminal `failed` result with `CANCELLED`; no output is represented as successful. |
| Provider execution timeout | An otherwise schema-valid mock Provider Execution result for the prepared `execution_id`: `status=timed-out`, `finish_reason=error`, `error.category=timeout`, `error.code=MOCK_TIMEOUT`, `error.message="Mock adapter deadline expired."`, `error.retryable=false`, `error.stage=adapter`, no output | Append exact normalized result bytes and verified canonical JSON v1 byte size/SHA-256 to protected `provider-outcome` keyed by `execution_id`; append `contract-mapping-blocked` keyed by `attempt_id`/`execution_id`. Emit no Comic Manifest result; do not invent `TIMEOUT`, coerce a status, retry, or auto-finalize. |
| Revision mismatch on retry | Retry entry points to a different production identity/revision | Reject as a retry before execution; require a fresh lineage for the changed revision. |
| Replay or overwrite | A second terminal write is submitted for a completed attempt, or existing attempt/result IDs are submitted with different bytes | Reject, including byte-identical replay writes; preserve the original immutable bytes and lineage. An identical read returns the stored result without mutation. |
| Storage-integrity failure | Stored bytes do not match recorded size/digest or protected storage is unavailable | Do not report a terminal success; fail closed without exposing paths or protected identifiers. |
| Preparation acknowledgment failure | The `prepared` index append fails or has an ambiguous response | No Provider Execution call occurs. Keep the attempt nonterminal and reconcile by fixed `attempt_id`/`execution_id`; do not execute until exactly one `prepared` entry is confirmed. |
| Ambiguous persistence matrix | After a confirmed `prepared` entry and exactly one mock call, inject failure/ambiguity at each point: `provider-outcome` append; `contract-mapping-blocked` append; `persisting` index append; immutable result write; terminal index append after verified readback | Before the outcome append is confirmed, do not discard the returned result or issue another call; reconcile by `execution_id`, remaining unresolved if exact outcome bytes cannot be recovered. A blocked-entry failure leaves the outcome recoverable but the attempt `reconciliation-required`. `persisting` append failure: no result write is submitted. Result-write failure: fixed candidate ID/digest and confirmed `persisting` entry remain; no terminal link is claimed. Terminal-link failure: the verified immutable result remains untouched. At every point keep the attempt nonterminal/reconciliation-required; do not repeat execution or writes, overwrite bytes, allocate substitute IDs, start a retry, or finalize while unresolved. |

## Compatibility and migration

No released bundle or accepted schema changes under this draft. Comic Manifest v1
is an unreleased candidate; any accepted lifecycle semantics that alter its closed
result representation require coordinated Codex/Platform review, updated
versioned schema/fixtures, and compatibility review before publication. The
[manifest versioning policy](../specs/manifests/COMIC-MANIFEST-VERSIONING.md)
continues to govern release boundaries. Existing Provider Execution and
Execution Provenance artifacts remain unchanged.

## Security and privacy

Only synthetic fixture data belongs in this public repository. Production result
bytes, private source material, credentials, store handles, restricted paths and
authority evidence remain in separately authorized protected systems. Public
fixture IDs and digests are fabricated. Neither result validation nor immutable
storage grants access, current use authority, rights, canon, or publication
permission.

## Rights, provenance, accessibility, and portability

The path is provider-free and offline. Inputs and transformations are recorded
as observed identities, not inferred explanations. Result/output validation does
not establish creative quality, accessibility, rights, or publication
suitability; those remain separate human review boundaries.

## Alternatives considered

### Reuse the provider execution ID as the build attempt ID

Rejected because an `execution_id` is scoped to one invocation, while an
`attempt_id` identifies orchestration and retry lineage. The bounded fixture
uses one call per attempt, but identity remains distinct and any later
multi-call attempt requires a separate association decision.

### Mutate the prior result when retrying

Rejected because it destroys the distinction between attempts and prevents
reliable audit of the exact inputs, transformations, outputs and terminal
outcome of each attempt.

### Add a new workflow DSL or storage API in Codex

Rejected for this bounded design. The proposal reuses current result fields and
leaves execution, retry eligibility, and storage implementations to their
separate owners and future approved scopes.

## Implementation plan

1. Obtain the contract owner's decision on the proposed protected append-only
   attempt index, cancellation mapping, immutable-write confirmation/recovery
   boundary, and canonical JSON v1 integrity envelope. Timeout mapping is
   deliberately deferred to a separately versioned contract decision.
2. If accepted, revise the relevant unreleased Comic Manifest candidate and
   fixture definitions in Codex; review affected Platform consumers before
   implementation.
3. Implement any runtime behavior only in separately authorized Platform work.
   No code, schema, runtime test, storage service, release, or production change
   is included in this draft.

## Owner decisions (proposed dispositions)

1. **Accept the protected append-only host index for this bounded path.** Store
   `prepared`, `provider-outcome`, `contract-mapping-blocked`, `persisting`, and
   `terminal` records with exact attempt/execution/result linkage. Each attempt
   has one Provider Execution call. Preserve caller `correlation_id` unchanged;
   defer multi-call attempts to a later design. This keeps host lifecycle data
   out of the closed Comic Manifest schema while retaining the exact protected
   Provider Execution outcome and blocked state by `execution_id`.
2. **Accept the persistence boundary and integrity checks.** Use canonical JSON
   v1 byte size and SHA-256 for protected Provider Execution outcomes and stored
   Comic Manifest result envelopes. Append `persisting` before one immutable
   result write, verify readback, then confirm the terminal index link. Keep any
   failed or ambiguous append/write nonterminal for explicit reconciliation;
   do not overwrite, silently repeat, execute again, retry, or auto-finalize.
   The precise store implementation and read-consistency guarantees remain
   separately designed.
3. **Accept explicit existing-diagnostic mappings.** For cancellation, use
   `partial` plus `CANCELLED` only when verified outputs are retained; otherwise
   use `failed` plus `CANCELLED`. For the finite normalized output-validation
   failure fixture, use `failed` plus `VALIDATION_FAILED`, with no Manifest
   output. These mappings add no diagnostic enum or result status.
4. **Accept the timeout deferral.** Preserve the exact `timed-out` Provider
   Execution result in the protected index and mark the attempt
   `contract-mapping-blocked`; emit no Comic Manifest terminal result until a
   versioned mapping is approved and explicitly reconciled. Do not infer a
   `TIMEOUT` diagnostic or automatically finalize/retry.
5. **Leave retry eligibility with O03/caller policy.** Only a terminal,
   reconciled attempt may be considered for a separately authorized retry. This
   RFC defines no retry budget or eligibility rule.
