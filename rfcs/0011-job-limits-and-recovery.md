# RFC 0011: Job limits and recovery semantics

- Status: Draft; contract-owner decision pending
- Authors: Codex draft for Studio O03
- Created: 2026-10-27
- Contract family: bounded orchestration over Comic Manifest and Provider Execution
- Compatibility: Proposed host-level policy; no schema or released-contract change in this draft
- Supersedes: None
- Superseded by: None
- Constitution version: 1.0.0
- Constitution tag: `constitution/v1.0.0`
- Constitution commit: `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Applicable checklist profile: RFC and stable specification
- Conformance evidence: [Studio issue #104](https://github.com/DefinitelySecureStudio/studio/issues/104); synthetic fixture expectations below
- Decision owner and required A4 reviewers: `@andrewperis`; Codex and Platform maintainers

## Summary

This draft proposes finite host limits and explicit cancellation, retry, and
recovery rules for one synthetic Comic Manifest production revision and one
offline mock Provider Execution call per attempt. It defines a nonresettable job
deadline, bounded resource use, an explicit one-retry ceiling, and fail-closed
resume behavior. Candidate numeric limits are recommendations for owner review,
not requirements inherited from an existing contract.

This proposal builds on the lifecycle design in [draft RFC 0010 at its exact
reviewed head](https://github.com/DefinitelySecureStudio/codex/blob/0de9e55dafe513c4178f0de8840a9df773bb3d08/rfcs/0010-build-attempt-lifecycle.md).
RFC 0010 is still a draft; this link records design input, not contract
acceptance. Neither RFC changes a schema or authorizes runtime, release, or
production work.

## Motivation and boundaries

[Studio O03](https://github.com/DefinitelySecureStudio/studio/issues/104)
requires a bounded job/time/resource model, injected clock/read/verification
seams, and cancellation, retry, and resume rules with failure examples. The
existing [Provider Execution v1](0002-provider-execution-v1.md) contract covers
one synchronous provider call, its per-call `timeout_ms`, and normalized
outcomes. It prohibits hidden adapter retries. The existing [Comic Manifest v1
candidate](../specs/manifests/comic-manifest-v1.md) bounds and identifies
documents, production revisions, build attempts, and results, but does not
define a complete host job budget or restart policy.

This draft specifies only one fully synthetic `comic-production` revision,
one offline mock call per attempt, and the existing `comic-build-result`
vocabulary. It adds no workflow language, JSON schema, runtime interface, queue,
storage implementation, provider, or authority. All job and recovery state
described below is proposed host/index state. Provider Execution's
`timeout_ms` and result taxonomy remain unchanged. The timeout result mapping
deferred in RFC 0010 stays deferred here.

## Specification (proposed)

### Identity and input pinning

A **job** is one bounded request to process one exact Comic Manifest production
revision. The protected host index assigns a new opaque `job_id` and records the
complete existing production reference: `production_id`, `revision`, and
canonical `identity`. Each **attempt** has distinct `attempt_id`, provider
`execution_id`, and (if a result is produced) `result_id`, following RFC 0010.
Each retry stays in the same job and exact production revision, receives fresh
attempt/execution/result IDs, and records `retry_of_attempt_id`. It never
rewrites prior records. A changed production identity or revision requires a
new job, not a retry or resume.

Before admission and before any resumed or retry attempt, an injected identity
verifier MUST verify the exact production reference and canonical bytes. A
matching logical ID with changed bytes is a revision mismatch and MUST be
rejected before a provider call. If the reference cannot be read or verified,
the host records an unresolved/blocked state and performs no execution.

### Proposed finite limits

The following candidate limits deliberately describe a small offline path.
They are **proposed defaults**, not values mandated by existing contracts. A
contract owner may accept or replace them before acceptance of this RFC.

| Limit | Proposed default | Scope and rationale |
|---|---:|---|
| Concurrent admitted jobs | 1; no queue | Keeps the bounded runner serial and makes the resource ledger auditable. A second job is rejected before admission, not silently queued. An unresolved job retains the slot until explicitly reconciled. |
| Total attempts per job | 2 (one initial attempt plus at most one explicit retry) | Bounds repeat work while allowing one narrowly eligible retry. Every attempt still has exactly one provider call. |
| Provider calls per attempt | 1 | Preserves Provider Execution v1's one-invocation boundary and RFC 0010's one-call association. |
| Job execution budget | 300,000 ms (5 minutes), measured monotonically from admission | Provides one bounded call and, if eligible, one retry without resetting the budget. This is a host job limit, not a change to the Provider Execution `timeout_ms`. |
| Rendered prompt | 8 MiB per attempt, or a lower exact descriptor `max_input_bytes` | A host-side input cap for this path; the adapter's declared limit remains effective and is never raised. |
| Normalized Provider Execution output content | 16 MiB UTF-8 per call | Bounds the text result while retaining existing output-token policy. The adapter/host must count bytes as they are received/normalized; an implementation that cannot enforce the cap fails closed. |
| Generated output artifacts | 64 MiB total across the job | Sums unique verified output artifact bytes across both attempts. Each artifact also stays within its production-declared `max_bytes` and profile cap. |
| Aggregate job material | 128 MiB | Counts each unique input, prompt, normalized outcome, generated artifact, and result once by verified identity/bytes. A repeated read of the same immutable identity does not count again. The ceiling accommodates an 8 MiB source document, two 8 MiB prompts, two 16 MiB provider outputs, 64 MiB of artifacts, and 1 MiB of control metadata with limited result-envelope headroom. |
| Host lifecycle metadata | At most 32 entries, 32 KiB of metadata per entry, and 1 MiB total reserved within the 128 MiB job ceiling | Bounds control/journal growth, including room for terminal and reconciliation markers. Referenced provider outcomes, prompts, results, and artifact payloads are charged by their own bytes against the remaining job budget. |
| Manifest document parse | Existing maximum 8 MiB, depth 32, 100,000 JSON values, and 32,768 UTF-8 bytes per string | Reuses the current Comic Manifest limits; consumers may apply stricter bounds, but this RFC does not relax them. |
| Individual output artifact | The exact production rendition's declared `max_bytes`, never above its existing profile cap | No per-artifact limit is raised. The aggregate job ceiling can reject a document/output set that individually fits existing limits. |

The existing Provider Execution descriptor and request limits continue to bound
provider input and output-token intent; this RFC adds no tokenizer or per-call
`timeout_ms` interpretation. The 1 MiB lifecycle-metadata reserve cannot be
borrowed for payload bytes. Before reading or transmitting a declared object,
the host MUST reserve its declared byte size against the aggregate budget. For
streamed or undeclared bytes it MUST count chunks with checked arithmetic and
stop before exceeding the cap; it MUST NOT allocate or write beyond the
remaining allowance. After identity verification, charge the object's actual
canonical/stored byte length. Missing or unverifiable size metadata is not
zero-cost. The 32 KiB entry cap applies to lifecycle-control metadata only; the
exact normalized outcome and any output payload are charged separately as
content bytes, with no truncation. The fixed-size index metadata and referenced
payload bytes are charged separately. Before dispatch, reserve the exact prompt
size, maximum per-call output content, maximum declared artifact bytes expected
for that attempt, and result/control metadata allowance. Release an unused payload
reservation only after the outcome and its actual byte identities are verified;
an ambiguous timeout/write does not release it. The same immutable verified
identity is charged once across rereads; a new identity is charged separately
even if its bytes happen to match.

The two-attempt cap includes attempts resumed from an existing index. Retries
do not reset the material or time budgets. A proposed job-level timeout is
measured from admission through provider execution; exact result preservation
and reconciliation rules below remain in force if a late or ambiguous
operation outlives it. If a required next result or index record would exceed
the material budget, stop before that write, preserve already verified
evidence, mark the job `budget-exhausted`, and require reconciliation. Do not
invent a terminal result or continue with an uncounted write.

### Clock and verification seams

The host receives three abstract dependencies; this RFC does not prescribe
their implementation:

1. **Monotonic clock:** returns a nonnegative safe-integer
   `monotonic_now_ms` and a stable `clock_epoch_id`. Admission records the tick,
   epoch, and proposed 300,000 ms budget in the protected index. The host derives
   the deadline with checked arithmetic. Resume MUST use the same epoch and the
   original admission tick. It MUST NOT restart the budget. If the clock cannot
   establish the same monotonic domain after a process or machine restart, mark
   the job `deadline-unverifiable`; do not call, retry, or infer unused time
   from wall time. Reconciliation remains available.
2. **Protected index reader:** retrieves and verifies job/attempt records by
   their fixed IDs and distinguishes confirmed absence from unreadable,
   conflicting, or ambiguous state. Inability to read is not evidence of
   absence. The reader supplies persisted budget counters and lifecycle state;
   missing counters block further work.
3. **Identity verifier:** confirms canonical bytes and exact identity for the
   production reference, provider outcome, output artifacts, and result bytes.
   A digest establishes byte identity only; it does not establish authority,
   rights, correctness, or publication suitability.

### Job and attempt transitions

The following names are host/index states, not new Comic Manifest statuses.
Index entries are append-only. A required append is considered confirmed only
when the injected reader verifies the exact event and its identity.

| Current state | Event | Required action and next state | Denial or unresolved behavior |
|---|---|---|---|
| No job | Admit request | Verify the exact production reference, limits, and available clock. Allocate `job_id`; append and confirm `admitted` with the original deadline, clock epoch, budgets, and pinned revision. | Invalid/stale revision, unavailable verifier/index/clock, or exceeded initial material budget: reject before an attempt or provider call. No job is queued. |
| Admitted | Prepare first attempt | Recheck that the original deadline, cancellation state, and material reservations permit work. Then allocate fresh attempt and execution IDs; append and confirm `prepared` for the same pinned revision before execution. | If any budget is exhausted, stop without an attempt/provider call. If `prepared` confirmation is absent or uncertain, do not call; reconcile by the fixed IDs. |
| Prepared | Start provider call | Recheck pinned revision, cancellation, clock, and budgets. Append and confirm `dispatch-started` before the single mock call. Invoke exactly once. | If the marker append is uncertain, do not call until reconciliation proves its absence. If `dispatch-started` is confirmed but no outcome is recoverable, mark `execution-unresolved`; never repeat this call. |
| Dispatch started | Provider returns an outcome | Preserve the exact normalized result as protected `provider-outcome`, keyed by `execution_id`, and confirm it before mapping a Comic Manifest result. | If writing/reading the outcome is ambiguous, retain the in-memory outcome if present, mark `reconciliation-required`, and do not call again, discard evidence, or create a result. |
| Outcome recorded | Outcome maps under RFC 0010 | Reuse RFC 0010's existing result/diagnostic mapping, freeze candidate result bytes and identity, and continue through its `result-prepared` and `persisting` states. | `timed-out` remains `contract-mapping-blocked` with the exact outcome recoverable by ID; this RFC does not map it to a Manifest status or retry it. |
| Persisting | Readback and terminal link | Verify exact immutable bytes and the terminal index entry per RFC 0010. Only a confirmed terminal link is terminal. | Ambiguous write/link, mismatch, or unreadable state remains nonterminal and requires reconciliation; no overwrite or substitute IDs. |
| Terminal and reconciled | Explicit retry request | Apply the eligibility checks below. If all pass, create a fresh attempt under the original job, preserving the prior attempt/result and pinned production revision. | No automatic retry. Exhausted limits, changed revision, cancelled job, blocked timeout, or unresolved prior state deny the retry. |
| Any admitted nonterminal state | Time deadline expires | Append/confirm `budget-exhausted` with reason `time` when metadata capacity permits; keep prior evidence intact. If an attempt has reached `dispatch-started`, request cancellation once if the call is in flight, then allow only preservation/finalization of that same attempt within its already reserved material budget. | No new provider call or retry. If outcome/persistence is uncertain, remain unresolved; do not claim terminal. |
| Any admitted nonterminal state | Material budget is exhausted | Append/confirm `budget-exhausted` with reason `material` from the reserved metadata allowance when possible. Keep prior evidence; allow only read-only reconciliation and control metadata within its reserve. | No new payload read/write, provider call, retry, or unbudgeted result. If a required payload cannot fit, remain unresolved; do not claim terminal. |

The `dispatch-started` marker is a proposed O03 addition needed to distinguish
confirmed preparation from a call that may already have begun. RFC 0010's
current draft does not define this marker. The owner must decide whether it is
added to the host index before the two drafts can be accepted together. If the
marker append is uncertain, execution is held until a reader proves whether it
exists; if it exists and there is no recorded outcome, the host does not
redeliver the call.

The job deadline prevents admission of a call or retry with no positive budget
remaining. When it expires during a provider call, the host requests cancellation
once through the existing out-of-band cancellation mechanism. It preserves any
normalized outcome that returns, even after the deadline. Bounded persistence
and terminalization of that already-started attempt may continue within its
previously reserved material budget; they do not reset the deadline or permit
another provider call or retry. If the required payload does not fit, or the
outcome/terminal state cannot be verified, the attempt stays unresolved.
Provider Execution's own `timeout_ms` continues to be evaluated from adapter
invocation start exactly as defined in that contract. This host budget does not
silently replace or reinterpret it.

### Cancellation

Cancellation is a request to stop future work; it cannot erase a provider call,
outcome, or write that may already have happened. Record the request in the host
index and apply the following rules:

- Before admission: reject the request; allocate no job or attempt IDs and make
  no provider call.
- After `prepared`, before confirmed `dispatch-started`: mark the job
  `cancelled-before-dispatch`; make no provider call and create no
  `comic-build-result`.
- After `dispatch-started`, while the call is in progress: signal cancellation
  once. Preserve the actual normalized Provider Execution result. If it returns
  `cancelled`, use RFC 0010's proposed mapping (`failed` plus `CANCELLED` when
  there are no verified outputs; `partial` plus `CANCELLED` only when verified
  outputs are retained). If it returns success after the request, do not relabel
  the provider outcome as cancelled; finish only already-admitted bounded
  validation/persistence, with no retry or additional call. If the result is
  incomplete, use only the existing partial/cancelled mapping when its schema
  conditions are met; otherwise remain unresolved because this draft defines no
  additional result mapping.
- After a normalized outcome is recorded but before persistence: preserve that
  outcome and stop any future attempt. Apply only the existing RFC 0010 mapping;
  cancellation does not rewrite success, failure, or a timeout into a different
  provider result.
- After result persistence starts: do not cancel, overwrite, or repeat the
  write. Read back and verify the fixed bytes and terminal link. If either is
  uncertain, retain the nonterminal reconciliation state.
- After terminal confirmation: cancellation has no effect on the immutable
  result; return the recorded terminal state.

The host cancellation state is not a Comic Manifest status. No cancellation
path bypasses exact revision checks, output identity checks, or the immutable
result boundary.

### Retry eligibility

A retry is an explicit caller action, never an automatic response to an error.
This draft proposes allowing at most one retry, and only when all of these
conditions hold:

1. The prior attempt and result are terminal and fully reconciled; no write,
   index append, outcome, or dispatch is ambiguous.
2. The prior normalized result is `failed` with category `rate-limit`,
   `retryable: true`, and a finite `retry_after_ms`. Its safe adapter/provider
   details must positively establish that the request was rejected before
   acceptance or action; no output exists. If the result cannot establish this,
   the outcome is not eligible.
3. The caller waits at least `retry_after_ms` and explicitly authorizes the new
   attempt.
4. The pinned production reference and exact bytes still verify unchanged.
5. The original job deadline, two-attempt ceiling, and aggregate byte budget
   leave positive room for the new attempt.

The retry receives new attempt, execution, and result IDs and records
`retry_of_attempt_id`; all prior outcomes and result bytes stay immutable. The
`retryable` field remains advice and does not itself authorize the retry.
Timeouts are blocked by RFC 0010; transport/provider ambiguity, provider
unavailability without a definite no-action outcome, output-validation,
authorization/policy errors, cancellation, changed production revision,
exhausted limits, and any unresolved write or call are ineligible. A changed
revision requires a new job and fresh approval context; it is never a retry of
the old job.

If the exact `rate-limit` fixture cannot demonstrate no output and no ambiguous
provider action, it does not qualify for retry. When the index or verifier
cannot establish this fact, deny retry and retain evidence for reconciliation.

### Resume and reconciliation

On restart, the host MUST read the protected index and verify the pinned
production reference before any action. It MUST reconstruct consumed time and
resource budgets from confirmed entries. Missing/unreadable counters, an epoch
mismatch, or a changed revision blocks new calls and retries. It MUST NOT infer
state from local memory, a directory listing, a mutable branch name, or an
unverified cache.

| Recovered state | Permitted resume action | Prohibited action |
|---|---|---|
| `admitted`, no attempt prepared | Prepare only if the original clock epoch and deadline verify, cancellation is absent, and all budgets remain. | Reset the start time/deadline; infer the production revision from a mutable ref. |
| `prepared`, no `dispatch-started` entry, and reader confirms absence | Continue to dispatch once after rechecking identity, cancellation, deadline, and budgets; or record pre-dispatch cancellation. | Call if marker absence is uncertain; create replacement IDs after an uncertain preparation. |
| `dispatch-started`, no verified `provider-outcome` | Mark `execution-unresolved`; preserve IDs and seek outcome by `execution_id`. | Redeliver the provider call, allocate another execution ID to disguise a retry, or assume no call occurred. |
| Verified `provider-outcome` | Reuse those exact bytes to continue deterministic outcome mapping and result preparation, subject to the original pinned revision and remaining material budget. After time expiry, only preservation/finalization of this existing attempt is allowed. | Call the provider again, retry, or normalize the same outcome differently to bypass a blocked state. |
| `contract-mapping-blocked` for timeout | Keep the result recoverable and blocked; allow read-only evidence retrieval. | Invent a timeout diagnostic, create a Comic Manifest result, retry, or auto-finalize. |
| `persisting`, candidate result bytes and digest verified | Read by fixed `result_id`; if matching immutable bytes exist, verify them and use explicit reconciliation to confirm the terminal link. | Change candidate bytes/IDs or repeat the immutable result write while its prior outcome is uncertain. |
| Terminal link confirmed and result bytes verify | Return the existing immutable result. | Add another terminal result, mutate lineage, or execute again under the same attempt. |
| Any unreadable, conflicting, or ambiguous state | Mark `reconciliation-required`; retain fixed IDs and verified evidence; allow read-only inspection. | Treat uncertainty as absence, success, failure, or retry permission. |

An explicit reconciliation can continue only an exact, previously prepared
transition after the reader establishes the prior side effect's outcome and the
identity verifier confirms the same bytes. It cannot authorize a new provider
call, change a production revision, or reset any budget. If the reader cannot
prove whether an append/write occurred, the job remains unresolved; do not
blindly repeat it. Reconciliation authority is a separate caller/owner gate,
not granted by this draft or by an index entry.

## Finite synthetic fixture expectations

These are proposed acceptance fixtures, not executed tests or evidence that the
semantics have been implemented. All use fabricated IDs and the existing public
Comic Manifest fixture; no real provider or protected source is involved.

| Case | Setup | Expected result |
|---|---|---|
| Concurrency boundary | One job is admitted; submit a second before the first is terminal. | Second job is rejected before ID allocation/provider call; no implicit queue. |
| Deadline below boundary | Inject monotonic elapsed time of 299,999 ms, then request an eligible retry with `retry_after_ms` already satisfied. | A retry may dispatch only while the original deadline still has positive time remaining and all other checks pass; original admission tick remains unchanged. |
| Deadline at/over boundary | Inject elapsed time of 300,000 ms or more before an initial/retry dispatch. | No dispatch marker or provider call is started; job is `budget-exhausted` for time. A call already started at positive budget is not redelivered; its existing outcome may still be preserved/finalized within material limits. |
| Restart with same clock epoch | Resume a confirmed `prepared` job before its original deadline, with no `dispatch-started` marker and unchanged production identity. | Reuse the fixed attempt/execution IDs and dispatch exactly once after reconfirming budgets. |
| Restart with changed epoch | The index is intact but the injected clock reports a different epoch or cannot prove elapsed time. | Mark `deadline-unverifiable`; no call, retry, or reset. Read-only reconciliation remains available. |
| Resource boundary | Inputs and unique material total exactly 128 MiB, then one additional byte is required. | Exactly-at-cap work can continue if all other limits pass; reject the extra byte before allocation, provider call, or write. Checked arithmetic overflow fails closed. |
| Component resource boundary | Prompt or normalized provider output is exactly its 8/16 MiB cap, then one byte over; artifact total exactly 64 MiB, then one additional byte is required. | At-boundary inputs/results may proceed if aggregate capacity remains. Reject over-bound prompts before the call, stop/reject over-bound provider output before normalization, and reject an additional artifact before write; preserve earlier records. |
| Existing Manifest parser boundary | Use an 8 MiB document at the existing parser limits, then one over the bound; separately exceed depth 32, 100,000 values, or 32,768 UTF-8 bytes in a string. | At-boundary input proceeds to schema validation; each over-bound input is rejected before execution with no partial parse treated as success. |
| Cancel before admission | Cancellation is already set at submission. | No job/attempt IDs, no provider call, no result. |
| Cancel after preparation, before dispatch marker | Confirm `prepared`, then request cancellation before `dispatch-started`. | Record `cancelled-before-dispatch`; make no provider call or Comic Manifest result. |
| Cancel after dispatch starts | Mock call receives one cancellation signal and returns normalized `cancelled`; no verified output exists. | Preserve exact execution outcome; map only through RFC 0010 to `failed` plus `CANCELLED`; do not retry. |
| Cancel arrives after successful response | Mock returns a valid success after cancellation request; result is already fully complete and verified. | Preserve the success; finish only bounded validation/persistence and return the exact complete result. Do not relabel Provider Execution as cancelled or start retry. |
| Cancel after call, before persistence | Successful or failed normalized outcome is confirmed in `provider-outcome`; cancellation arrives before `persisting`. | Preserve the exact provider outcome, stop future attempts, and apply only RFC 0010's existing result mapping. Do not rewrite the outcome or retry. |
| Cancel during persistence | Result write/readback is ambiguous. | Preserve fixed IDs/digest, remain nonterminal, reconcile by reads; never overwrite or retry the write blindly. |
| Eligible retry | First attempt is terminal/reconciled, failed with `rate-limit`, `retryable=true`, `retry_after_ms`, safe provider detail `RATE_LIMITED_BEFORE_ACCEPTANCE`, no output, same production identity, positive budgets, and explicit caller retry. | Exactly one new attempt with new attempt/execution/result IDs and `retry_of_attempt_id`; prior records unchanged; one provider call. |
| Retry denials | Repeat with cap exhausted, deadline expired, insufficient bytes, no explicit caller action, missing retry delay, `retryable=false`, changed revision, cancellation, timeout, or ambiguous call/write. | Reject before any new provider call; preserve evidence and prior records. |
| Retry delay exceeds budget | Eligible `rate-limit` result has `retry_after_ms` greater than the remaining job deadline. | Deny retry; do not reset the deadline or shorten the provider-specified delay. |
| Recovery from `provider-outcome` | Confirm outcome record and unchanged production identity; no result prepared yet. | Resume mapping from the exact stored outcome without another provider call. A timeout remains `contract-mapping-blocked`. |
| Recovery from `persisting` | Result bytes match the fixed digest; terminal link absent and reader verifies absence. | Permit only explicit reconciliation to link the already verified immutable bytes; do not repeat result write or allocate a new ID. If link absence is uncertain, remain unresolved. |
| Corrupt or unreadable recovery state | Index, result, or production bytes conflict or cannot be read. | `reconciliation-required`; no call, retry, overwrite, assumed absence, or fabricated terminal result. |

The existing repository test suite and CI validate current contracts and build
health. They do not execute these proposed O03 semantic fixtures unless a later
separately authorized implementation adds them.

## Compatibility and migration

No schema, released contract, or implementation changes under this draft. The
proposal uses host-only job/index state and existing Provider Execution,
Comic Manifest, and RFC 0010 identities. The new `job_id`, `dispatch-started`
marker, resource ledger, and retry policy require owner approval and a
coordinated RFC 0010/RFC 0011 decision before any normative adoption. Existing
per-call `timeout_ms` semantics do not change. Any change to the closed Comic
Manifest result/status/diagnostic shape requires a separately versioned
contract and coordinated consumer review.

## Security and privacy

Use only synthetic fixture records and mock outcomes in this public RFC.
Credentials, production data, private source material, raw prompt/output bodies,
restricted locations, and live authority evidence stay outside the public
repository. Index IDs and byte digests establish lookup or byte identity; they
do not prove permission, source rights, content correctness, or publication
authority. Recovery MUST fail closed when identity, clock, index, or storage
evidence is missing or ambiguous.

## Alternatives considered

### Reset the job deadline on resume or retry

Rejected because repeated restarts could extend work without bound and invalidate
the job's original resource budget. The original monotonic admission deadline
must remain fixed; an unverifiable clock epoch blocks further execution.

### Automatically retry every result marked retryable

Rejected because Provider Execution defines `retryable` as advice, not
authorization, and ambiguous outcomes may duplicate side effects. This draft
allows only an explicit, bounded retry after a resolved no-output rate-limit
result.

### Reissue a call when no outcome record is visible

Rejected because the call may have happened and the outcome/index may be
temporarily unreadable. `dispatch-started` makes this uncertainty explicit;
reconciliation must establish the prior call outcome before further work.

## Implementation plan

1. Record the contract owner's decisions on the proposed numeric limits,
   `job_id`/`dispatch-started` host index, clock-epoch behavior, cancellation
   mapping, and retry allowlist.
2. Reconcile accepted RFC 0011 decisions with the still-draft RFC 0010 and
   confirm the exact host-index fields and recovery authority boundary.
3. If separately authorized, add synthetic fixture tests for the table above in
   the appropriate implementation repository. No schema, runtime, storage,
   real-provider, release, or production work is included here.

## Owner decisions (proposed dispositions)

1. **Adopt the candidate finite limits or provide replacements:** one active
   job/no queue, two attempts total, one provider call per attempt, 300,000 ms
   job execution budget, and 128 MiB aggregate material. These values are
   stricter host policy over existing per-document/profile limits; they do not
   change Provider Execution `timeout_ms`.
2. **Accept host-only identity and dispatch marker:** one opaque `job_id` and
   confirmed append-only `dispatch-started` entry, coordinated with RFC 0010.
   A marker that may exist blocks redelivery until the reader reconciles it.
3. **Accept clock and budget recovery:** same stable monotonic epoch and original
   admission deadline only; no reset. An unavailable/different epoch blocks
   new calls and retries while allowing read-only reconciliation.
4. **Accept the conservative retry allowlist:** at most one explicit retry, only
   after a terminal/reconciled `rate-limit` result proves no output or ambiguous
   action, with finite `retry_after_ms`, unchanged production bytes, and
   positive remaining job/time/material budgets. All other outcomes remain
   ineligible in this bounded version.
5. **Accept cancellation as a request, not outcome rewriting:** before dispatch
   it prevents the call; during a call it signals cancellation once and
   preserves the actual normalized result; during persistence it requires
   reconciliation. Use only RFC 0010's proposed existing Manifest mappings.
6. **Preserve RFC 0010 timeout and integrity deferrals:** a timed-out outcome
   remains protected and `contract-mapping-blocked`; uncertain writes remain
   nonterminal. No invented Manifest status/diagnostic, automatic finalization,
   or blind side-effect retry is authorized.

These are design decisions only. Until the contract owner records acceptance,
this RFC remains non-normative and no implementation or production use follows.
