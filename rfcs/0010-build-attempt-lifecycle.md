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
Comic Manifest production revision, using one offline mock execution and ending
in an immutable terminal result. It reuses the existing `production` reference,
`attempt_id`, `result_id`, `comic-build-result`, execution transformation and
output fields. It defines retry lineage and result storage semantics without
introducing a workflow DSL or runtime implementation.

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
one exact revision → one offline mock execution → one terminal
`comic-build-result`. Use the existing [Comic Manifest fixture](../fixtures/comic-manifest-v1.json)
and existing schema/conformance vocabulary. Fixture IDs, bytes, authorities and
references remain synthetic.

The exact revision is the complete existing production reference:
`production_id`, `revision`, and canonical `identity`. A matching logical ID or
revision number without the matching identity is insufficient.

`attempt_id` identifies one orchestration attempt; `result_id` identifies its
separate terminal result. Both reuse the Comic Manifest candidate's UUIDv4 URN
format and are allocated outside deterministic processing. Provider-level
`execution_id` values remain distinct and identify individual adapter calls.
Identifiers are not content digests and convey no authority.

### Lifecycle and transition table

| State | Event | Required record/effect | Rejection condition |
|---|---|---|---|
| No attempt | Start | Allocate a fresh `attempt_id`; bind it to the exact production reference; record `retry_of_attempt_id: null` for a first attempt. Persist the attempt entry before work begins. | Missing or mismatched production identity; reused attempt ID; unavailable protected store. |
| Started | Mock execution and build-result verification succeed | Create one `comic-build-result` with a distinct `result_id` and the same `attempt_id` and production reference. Preserve actual inputs, ordered transformations, verified outputs, status `complete`, and no diagnostics. | Any required input, transformation, or output identity is absent or mismatched; an unverified output is treated as successful. |
| Started | Execution fails or is cancelled | Create a terminal `comic-build-result` using existing status/diagnostic fields. Proposed mapping: use `partial` only when verified outputs are retained; otherwise use `failed`. Include a safe failure diagnostic or the existing `CANCELLED` diagnostic. Neither result is release-eligible. | Claiming `complete` with diagnostics or incomplete/unverified outputs; emitting unsafe diagnostic content. |
| Terminal attempt | Caller authorizes a retry | Allocate new attempt and result IDs. Set `retry_of_attempt_id` to the prior attempt ID and retain the exact same production reference. Preserve the prior attempt and result unchanged. Eligibility and retry limits are outside this RFC and belong to O03/caller policy. | Hidden or automatic retry; changed production reference; overwriting a prior attempt/result. |
| Any attempt | Production revision changes | Start a new lineage with a fresh attempt ID and no retry link. A changed exact production reference is not a retry. | Carrying a prior result, output, or approval to the new revision. |
| Terminal result | Store and later read | Persist exact result bytes in protected immutable storage. Keep the `result_id` separate from a storage integrity digest; the storage boundary records and verifies exact byte size and digest. A result is terminal only after storage confirms the immutable write. | Same ID with different bytes, conflicting second terminal result, digest mismatch, or inaccessible result reported as complete. |

The `retry_of_attempt_id` relation is not present in the current closed Comic
Manifest schema. This draft recommends recording it in a protected append-only
attempt index, alongside the existing `comic-build-result`, rather than adding a
new public field before the contract owner's decision. The index is a logical
record boundary, not a prescribed storage API or workflow language. The owner
must decide whether this private index is acceptable or whether retry lineage
belongs in a future versioned result contract.

The proposed index contains only these lifecycle references:

- A start entry: `attempt_id`, exact `production` reference, and nullable
  `retry_of_attempt_id`.
- A terminal entry: the same `attempt_id`, terminal result status, `result_id`,
  and protected immutable result reference with its verified size and digest.

Entries are append-only. A terminal entry does not update or replace the start
entry, and the prior attempt's entries are never changed when a retry begins.
This describes identity and linkage only; it does not prescribe a database,
queue, storage API, retention period or runtime interface.

Storage integrity metadata is not a new field in `comic-build-result`. This draft
recommends reusing Studio canonical JSON v1 byte-size/SHA-256 semantics from
Execution Provenance for the stored result envelope while keeping the result's
existing `result_id` as its opaque record identifier. The owner must confirm this
boundary before any schema or consumer change.

An identical read of an already stored terminal result is not a new execution.
Any second terminal-result write for an already terminal attempt MUST be rejected,
including a byte-identical replay; reads of the existing stored result remain
allowed. A conflicting replay under an existing attempt or result ID MUST fail
closed, and the original bytes and lineage remain unchanged. After an ambiguous
store response, the caller verifies the existing record before taking further
action; it does not submit a second terminal write.

### Finite fixture expectations

These cases are proposed acceptance fixtures, not executed tests or evidence of
authorization. All use synthetic data from the existing Comic Manifest fixture.

| Case | Input | Expected evidence |
|---|---|---|
| First successful attempt | One exact production reference and one mock execution | New attempt/result IDs; result binds the same exact revision; actual input identities, ordered transformation digests and verified output identities are preserved; terminal `complete` is stored immutably. |
| Retry after terminal failure | A prior failed result and explicit caller retry authorization | New attempt/result IDs; retry link to the prior attempt; same exact production reference; prior result bytes and status remain unchanged. Retry eligibility itself is not decided here. |
| Failure without usable output | Mock execution returns a normalized failure | Terminal `failed` result with a safe diagnostic; no successful output or release claim. |
| Cancellation with retained verified output | Cancellation after a fixture output is independently verified | Terminal `partial` result with `CANCELLED`; only the verified output is retained; result cannot support release. |
| Cancellation before usable output | Cancellation before any output is verified | Terminal `failed` result with `CANCELLED`; no output is represented as successful. |
| Revision mismatch on retry | Retry entry points to a different production identity/revision | Reject as a retry before execution; require a fresh lineage for the changed revision. |
| Replay or overwrite | A second terminal write is submitted for a completed attempt, or existing attempt/result IDs are submitted with different bytes | Reject, including byte-identical replay writes; preserve the original immutable bytes and lineage. An identical read returns the stored result without mutation. |
| Storage-integrity failure | Stored bytes do not match recorded size/digest or protected storage is unavailable | Do not report a terminal success; fail closed without exposing paths or protected identifiers. |

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

Rejected because one build attempt can contain more than one provider execution,
while `execution_id` is scoped to one invocation.

### Mutate the prior result when retrying

Rejected because it destroys the distinction between attempts and prevents
reliable audit of the exact inputs, transformations, outputs and terminal
outcome of each attempt.

### Add a new workflow DSL or storage API in Codex

Rejected for this bounded design. The proposal reuses current result fields and
leaves execution, retry eligibility, and storage implementations to their
separate owners and future approved scopes.

## Implementation plan

1. Obtain the contract owner's decision on retry-lineage placement, cancelled
   result mapping, and stored-result integrity metadata.
2. If accepted, revise the relevant unreleased Comic Manifest candidate and
   fixture definitions in Codex; review affected Platform consumers before
   implementation.
3. Implement any runtime behavior only in separately authorized Platform work.
   No code, schema, runtime test, storage service, release, or production change
   is included in this draft.

## Unresolved questions

1. Does the owner accept a protected append-only attempt index for retry lineage,
   or require the relation in a versioned `comic-build-result` contract?
2. Does the proposed `partial`/`failed` plus `CANCELLED` diagnostic mapping match
   the intended build-result semantics?
3. Is the protected storage envelope's canonical JSON v1 byte-size/digest
   metadata the required integrity boundary, and what evidence reference is
   recorded when a write is unavailable or ambiguous?
4. What O03 recovery rule applies when a result-store write has an ambiguous
   outcome and a read cannot establish whether the immutable record exists?
5. Which O03 rules determine whether a failed or cancelled attempt may be retried?
