# RFC 0002: Provider Execution Contract v1

- Status: Accepted upon owner-approved merge; unreleased until the Prompt SDK v1 release
- Authors: `@andrewperis`
- Created: 2026-08-19
- Contract family: Execution contracts
- Compatibility: New contract
- Supersedes: None
- Superseded by: None
- Constitution version: 1.0.0
- Constitution tag: `constitution/v1.0.0`
- Constitution commit: `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Applicable checklist profile: ADR, RFC, stable specification, and agent/automated workflow
- Conformance evidence: [`PROVIDER-EXECUTION-V1-CONFORMANCE.md`](../specs/execution-contracts/PROVIDER-EXECUTION-V1-CONFORMANCE.md)
- Decision owner and required A4 reviewer: `@andrewperis`
- Studio architecture: [ADR 0016](https://github.com/DefinitelySecureStudio/studio/blob/main/adr/0016-prompt-sdk-architecture.md)
- Related issue: [Studio #65](https://github.com/DefinitelySecureStudio/studio/issues/65)

## Summary

Adopt Provider Execution Contract v1.0.0 as the portable boundary for one
configured model-adapter target, one synchronous execution request, and one
normalized final result. The contract defines target identity, capability
negotiation, portable generation parameters, namespaced extensions, timing,
usage, finish status, output identity, and retry-aware errors without exposing
provider credentials or vendor-native request/response objects.

Codex owns the durable schema and meanings. Platform implements the executor,
mock adapter, and provider-specific adapters. The candidate becomes accepted on
merge but remains unreleased until issue #72 publishes the immutable Prompt SDK
v1 contract bundle.

## Motivation

Direct provider SDK calls would leak model roles, parameter ranges, response
objects, error classes, transport behavior, and mutable model defaults into
Studio core code. Callers could no longer determine whether two adapters
preserve required behavior, whether an error is safe to retry, or which actual
provider/model produced an output. Silent fallback or provider routing would
also undermine provenance and budget/authority boundaries.

ADR 0016 requires a replaceable adapter seam, a synchronous text-first v1
baseline, explicit capability/extension negotiation, normalized outcomes, and
provider identity preservation. This RFC makes that seam independently
implementable and testable before any real provider SDK is selected.

## Decision

Use one closed JSON Schema with three discriminated document kinds:

1. an adapter descriptor for an exact adapter/provider/model target;
2. an execution request carrying one verified rendered prompt and explicit
   caller policy; and
3. an execution result carrying one normalized success or failure fact.

The logical adapter interface exposes `describe` and `execute`. Platform
preflights identity, capabilities, parameters, extensions, integrity,
classification/retention, timeout, and cancellation before one adapter call.
The adapter translates only fields it declares, obtains credentials outside the
contract, and returns a normalized outcome. Neither layer retries automatically.

V1 defines `text-generation`, `structured-output`, and `seeded-generation`.
Portable parameters are `max_output_tokens`, `temperature`, `top_p`, exact stop
sequences, and seed. Their bounded values are portable control intent, not a
promise of identical sampling/tokenization across providers. Unsupported or
out-of-range controls fail instead of being silently clamped.

Provider-only behavior uses exact namespaced extension envelopes with explicit
required/fallback policy. The normalized error taxonomy separates caller/config
faults, access/policy failures, capability mismatch, throttling/quota,
timeout/cancellation, provider/transport failure, invalid responses, output
validation, and internal invariants. `retryable` is bounded advice and never
authorization.

## Consequences

- Core SDK execution and conformance tests need no provider SDK.
- Every execution preserves exact adapter/provider/model identity and a safe
  normalized outcome.
- Adapters must declare portable limits/defaults and reject translations they
  cannot preserve.
- Callers must provide explicit idempotency, delegation, observability,
  classification, timeout/cancellation, and extension policy.
- Platform needs generated schema validation, semantic cross-document checks,
  a mock adapter, output identity computation, and structured error mapping.
- Streaming, async jobs, media/multimodal behavior, tools, routing, context trust,
  output repair, and durable provenance remain separate contracts.

## Compatibility and migration

This is a new contract with no migration from a stable predecessor. Existing
experimental provider calls MUST be reviewed and restated; they MUST NOT be
grandfathered as conforming merely by wrapping their native request objects.

The compatibility rules are normative in
[`VERSIONING.md`](../specs/execution-contracts/VERSIONING.md). Changes to digest
coverage, status/error semantics, retry classification, portable parameter
meaning, capability negotiation, or required failure behavior are breaking.
Optional negotiated additions require a new minor version. Old execution
results remain immutable under their recorded contract version.

## Security, privacy, and rights

No document has a credential field. Adapter credentials enter only through
approved runtime configuration. Rendered prompts and outputs retain
classification, and public evidence uses safe identities/references rather than
sensitive bodies. Provider/model output cannot grant authority, establish
Canon, prove truth/quality/rights, or approve publication.

Delegation metadata records authority that already exists; it cannot create it.
Observability body capture is explicit and requires restricted controls for
sensitive data. Provider diagnostic details are limited to safe codes/status/
request IDs and restricted evidence references. Extensions cannot execute code,
weaken validation, supply secrets, add hidden calls, or broaden data access.

Provider terms, training/retention, region, subprocessors, safety, rights, and
accessibility require separate human review before a real adapter is enabled.

## Alternatives considered

### Import provider SDK types into Prompt SDK core

Rejected because vendor types would define durable semantics, spread
credentials/transports through core code, and make provider replacement or
independent conformance impractical.

### Use one lowest-common-denominator string API

Rejected because it would hide capabilities, structured-output intent,
parameters, classification, target identity, cancellation, usage, finish
reasons, extensions, and error evidence.

### Normalize every provider parameter

Rejected because many controls have vendor-specific or model-specific meaning.
Only bounded v1 controls are portable; everything else requires an explicit
reviewed extension and exit behavior.

### Let adapters route/fallback/retry internally

Rejected because hidden calls change cost, provider/model identity,
idempotency, data processing, and provenance. Build Orchestrator or another
authorized caller owns bounded retry/routing policy using explicit results.

### Treat provider errors as opaque strings

Rejected because callers could neither distinguish permanent faults from
conditional retry candidates nor preserve provider diagnostic identity safely.
The normalized category plus bounded provider details provides both portability
and useful escalation evidence.

### Put streaming and asynchronous jobs in v1

Rejected because event ordering, partial-output handling, resumability,
backpressure, queues, cancellation races, and retention need dedicated
contracts. V1 reserves discovery modes without pretending to define them.

## Implementation plan

On Codex merge, Platform compiles the exact candidate schema, implements
provider-neutral preflight/execution/result normalization, and supplies a
deterministic mock adapter and failure tests. No real provider adapter is needed
to accept the contract.

Issues #66–#69 add registry, context, structured-output, and provenance
boundaries. Issues #70–#71 expand CLI/CI/conformance coverage. Issue #72 packages
and publishes the reviewed immutable Codex/Platform v1 releases and replaces
every provisional commit dependency with a full artifact tuple.

## Unresolved questions

- Exact streaming event and asynchronous job contracts are deferred.
- Media and multimodal capability/parameter schemas are deferred.
- Provider routing/fallback strategy belongs to an authorized outer workflow.
- Structured-output parse/validation/repair details belong to #68.
- Durable event/provenance retention and observer APIs belong to #69.

None of these questions permits a v1 implementation to hide provider identity,
perform undeclared calls, weaken a requirement, or treat model/provider output
as authority.
