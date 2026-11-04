# Comic build result 1.1.0 local candidate

Status: unreleased implementation candidate, 2026-10-31. Owner: @andrewperis.
Related: [RFC 0012](../rfcs/0012-no-output-failed-build-results.md), Studio
[O02](https://github.com/DefinitelySecureStudio/studio/issues/103) and
[O03](https://github.com/DefinitelySecureStudio/studio/issues/104).

This bounded implementation selects **1.1.0**, an additive result representation,
with schema ID `urn:definitely-secure:contract:comic-manifest:1.1.0:comic-build-result`.
Its [schema](../schemas/json/comic-manifest/v1.1/comic-build-result.schema.json)
has a result-only root. Its referenced definitions retain existing record
constraints; they do not advertise new production, release or approval support.
The released 1.0.0 schema, specification, fixtures and artifacts are immutable.
The candidate remains subject to contract-owner review before normative adoption.
Local implementation authorization does not publish a contract or enable a
production consumer. No release tuple or adoption date is invented.

## Exact capability and compatibility choice

This is an additive minor candidate: all previously valid build-result shapes
remain supported when explicitly emitted with result version 1.1.0, and the
new representation adds one truthful failed-result case. Consumers negotiate the
**exact result capability** `1.1.0` before this form is emitted. Existing v1
consumers continue to reject the new version. A result can refer to the exact
unchanged v1 production identity; changing result version does not rewrite the
production. Successful prototype results continue to use 1.0.0. This bounded
consumer implements no 1.1 production, publication or approval workflow.

## No-output representation

A transformation with empty `output_digests` requires all of the following:

- `status: failed`, `outputs: []`, `diagnostics: [OUTPUT_MISSING]`;
- exactly one transformation, with nonempty actual verified `input_digests`;
- both withheld flags false; no invented digest or omitted provider output;
- existing inputs, production reference, distinct result/attempt identities,
  execution time order, tool linkage, classification and gate rules preserved.

The bounded mock path records the consumed canon and rendered prompt identities,
in that order. Schema validation cannot prove that output bytes never existed.
The host MUST independently retain and verify protected proof of rejection
before acceptance/action and absence of output. Unknown or inaccessible output,
cancellation, validation failure and timeout cannot use the no-output form.
Existing failed results with verified output digests retain their prior meaning.
This version introduces no cancellation mapping, new diagnostic or public proof
field. Provider detail and retry timing remain protected host metadata.

## Lifecycle and retry decision

| Transition | Required evidence | Failure behavior |
|---|---|---|
| admitted → prepared | exact synthetic v1 production and prompt bytes pinned; original ceilings/deadline reserved | no dispatch |
| prepared → dispatch-started | confirmed append; one mock call per attempt | unconfirmed append blocks execution |
| outcome → result-prepared | immutable normalized Provider Execution v1 outcome; rate-limit category, retryable true, finite delay 1–86,400,000 ms, `RATE_LIMITED_BEFORE_ACCEPTANCE`, no output; exact 1.1 capability | preserve outcome; mapping blocked |
| result-prepared → persisting → terminal | freeze result identity, write once, exact readback, confirm terminal link | reconciliation required; no replay or replacement IDs |
| terminal → explicit retry | caller `authorizeRetry: true`; elapsed delay; original deadline/material budget; maximum two attempts; prior result, outcome, input/prompt bytes and terminal links all reverified | no retry dispatch |
| retry → terminal | new attempt/execution/result IDs; `retry_of_attempt_id`; unchanged production and old records | no third attempt |
| restart → inspect | read-only integrity verification | no automatic finalization or retry |

The first failed terminal result is not a closed job while retry remains open.
The caller may explicitly decline it. The second result closes the job regardless
of outcome. The five-minute deadline and material ledger are never reset. Delay
is conservatively measured from the first terminal result, so persistence time
cannot shorten the provider delay. Adapters perform no hidden retry.

## Migration and review boundary

No historical record is rewritten, relabeled or replayed. Keep v1 available for
the entire unreleased candidate evaluation; there is no scheduled removal.
Platform uses a separate experimental validator and `noOutputResultVersion:
'1.1.0'` submission option. Omission preserves the prior blocked behavior.
Production adoption still requires the reviewed Codex source commit and schema
identity, coordinated consumer provenance, conformance, explicit acceptance and
separate release authorization. O02/O03 remain open pending those owner verdicts.

The finite synthetic [fixture](../fixtures/comic-build-result-v1.1-candidate.json)
and [negative matrix](../fixtures/comic-build-result-v1.1-candidate-cases.json)
cover shape and exact-version compatibility. Platform adds actual-input,
protected-proof, delay, authorization, budgets, immutable-write/link, one-retry,
cancellation and restart cases. No real providers, persistent storage, daemon,
access/security changes, creative content or production readiness are included.
