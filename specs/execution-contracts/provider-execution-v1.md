# Provider Execution Contract Specification v1.0.0

- Status: Accepted upon owner-approved merge; release pending Studio issue #72
- Version: 1.0.0
- Owners: Definitely Secure Studio Codex maintainers (`@andrewperis`)
- RFC: [RFC 0002](../../rfcs/0002-provider-execution-v1.md)
- Schema: [`provider-execution.schema.json`](../../schemas/json/execution-contracts/v1/provider-execution.schema.json)
- Replaces: None
- Constitution version: 1.0.0
- Constitution tag: `constitution/v1.0.0`
- Constitution commit: `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Applicable checklist profile: ADR, RFC, stable specification, and agent/automated workflow
- Conformance evidence: [`PROVIDER-EXECUTION-V1-CONFORMANCE.md`](PROVIDER-EXECUTION-V1-CONFORMANCE.md)

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**,
and **MAY** describe normative requirements.

## Purpose and boundary

Provider Execution Contract v1 defines the provider-neutral boundary between a
Studio caller, the Platform executor, and one model adapter. It has three closed
JSON document kinds:

- `provider-adapter-descriptor`: the exact capabilities and portable parameter
  ranges of one configured adapter/provider/model target;
- `execution-request`: one authorized synchronous invocation of one canonical
  rendered prompt; and
- `execution-result`: one normalized final success, failure, cancellation, or
  timeout outcome.

Codex owns these durable meanings. Platform implements the executor and
adapters. Provider SDKs, credentials, transports, rate limits, and raw responses
remain inside adapter packages and approved runtime configuration. Prompt
definitions remain provider-neutral and MUST NOT contain these execution
documents or vendor-native request objects.

This contract does not define registry resolution (#66), context-package trust
validation (#67), structured-output parsing/repair (#68), durable provenance and
observer retention (#69), autonomous tool use, multi-step orchestration,
streaming, or asynchronous job protocols.

## Normative representation

Every document MUST be UTF-8 JSON without a byte-order mark and MUST validate
against the linked Draft 2020-12 schema. Duplicate object member names are
invalid even when a parser would retain only the last value. Object member order
is insignificant; array order is significant. Every object is closed except
extension `configuration`, warning `details`, and explicitly referenced
artifacts.

`spec_version` MUST equal `1.0.0`. `kind` selects exactly one schema kind. A
consumer MUST reject an unsupported contract version, kind, field, enum value,
or required extension before provider execution.

Schema validation establishes shape only. Semantic validation MUST additionally
enforce uniqueness by named identity, cross-document matching, range/default
consistency, rendered-prompt integrity, retry taxonomy, timing/usage arithmetic,
classification/retention policy, and extension fallback behavior below.

## Logical adapter interface

An adapter implements two logical operations:

1. `describe()` returns one validated descriptor for the exact configured
   adapter/provider/model target without exposing credentials.
2. `execute(request, cancellation)` performs at most one provider invocation and
   returns one normalized outcome or raises one normalized adapter error.

The interface is language-neutral. Platform MAY express it with asynchronous
language primitives even though the v1 execution mode is `synchronous`.
Synchronous means the caller receives one final result for one request; it does
not mean a thread-blocking API. Streaming events and asynchronous job handles
require later contracts.

The executor MUST call `describe()` and complete preflight negotiation before
`execute()`. It MUST NOT call the adapter after a preflight error. The adapter
MUST NOT silently retry, route to another provider/model, weaken a requirement,
clamp a parameter, drop a required extension, repair output with another model
call, or broaden data access. A caller-authorized outer workflow owns retry and
routing policy.

## Adapter descriptor

### Identity

`adapter.id` is a Studio-controlled namespaced identifier and `adapter.version`
is the implementation contract version. `provider.id`, `model.id`, and optional
`model.revision` are the actual configured provider/model identities. They MUST
be accurate, reader-safe, and preserved in every result. A friendly display name
has no identity authority.

Changing adapter translation behavior requires an adapter version change.
Changing provider/model/revision produces a different descriptor and MUST NOT be
hidden behind a prior identity.

### Execution modes

`execution_modes` MUST contain `synchronous`. V1 core executes only that mode.
`streaming` and `asynchronous` are discovery declarations reserved for later
contracts; their presence does not let a v1 caller request those modes.

### Capability vocabulary

Capability descriptor names MUST be unique. V1 defines:

| Capability | Meaning |
| --- | --- |
| `text-generation` | Accept ordered Studio text messages and return one text or JSON-text outcome. Every v1 descriptor and request requires it. |
| `structured-output` | Apply provider-native or adapter-emulated output constraints. It does not replace the independent #68 parser/validator. |
| `seeded-generation` | Accept the portable `seed` parameter. A seed is a reproducibility hint only and never guarantees identical output across requests, revisions, adapters, or providers. |

Other names are unsupported until a released Codex contract defines them or a
consumer explicitly registers a namespaced capability. A core-looking unknown
name MUST NOT acquire semantics from a provider SDK.

`implementation` is `native` when the target directly supports the capability
and `emulated` when the adapter preserves the declared baseline through a
documented translation. Material emulation MUST produce a result warning when
used. Emulation MUST NOT be declared when it weakens a required constraint.

Optional `limits` declare maximum input bytes, maximum output tokens, accepted
input media types, and output media types. A request outside a limit fails
preflight; an adapter MUST NOT truncate, transcode, or change output kind
silently.

### Portable parameter support

`parameters` advertises only portable fields the target can represent. Each
numeric/integer range MUST have `minimum <= maximum`; a declared `default` MUST
fall inside that range. Descriptor ranges for `temperature` and `top_p` MUST be
subsets of the request domains below. `seed` support requires the
`seeded-generation` capability.

Omitted support means the parameter is unsupported, not that the adapter may
pass it through natively. Provider-only controls belong in an extension.

### Supported extensions

`supported_extensions` contains exact namespace strings. Support is scoped to
this descriptor version and target. An adapter MUST validate configuration for
each supported namespace before provider contact. A shared prefix does not imply
support for another namespace or version.

## Execution request

### Identity and idempotency

`execution_id` identifies this attempted execution and MUST be unique in the
caller's evidence boundary. `correlation_id` groups related work without
changing identity. `idempotency_key` is REQUIRED, MUST be non-secret, and MUST
remain stable only for a semantically identical authorized request.

The key does not authorize automatic replay and does not prove a provider
honored idempotency. An ambiguous transport failure remains explicit until the
caller can establish whether the provider acted.

### Rendered prompt

`rendered_prompt` contains the provider-neutral `studio-rendered-messages-v1`
intermediate created under issue #63. It includes definition/renderer identity,
classification, ordered messages, value-free input/context provenance, canonical
UTF-8 byte size, and SHA-256 digest.

When context came from a Context Package v1 document, each context provenance
entry additionally preserves exact package id/version/instance and manifest
digest, section digest/source ids, referenced source id/kind/version/classification,
and authorization decision id/reference.
Those fields are value-free facts and MUST survive adapter translation. Raw
context content and private source/evidence references remain only in rendered
message bytes under their effective classification and MUST NOT be copied into
provider metadata or public logs.

The digest and byte size cover Studio canonical JSON v1 of the rendered prompt
object before its `byte_size` and `sha256` wrapper fields are added. An executor
MUST reconstruct and verify those bytes before negotiation. A mismatch is an
`invalid-request` preflight error. It MUST NOT recompute identity over a
provider-native translation.

Message order and content MUST reach the adapter unchanged. Adapter translation
may map Studio roles to provider roles, but any material role loss requires a
warning and MUST fail when it would weaken an instruction or required behavior.

### Target

`target.adapter_id`, `provider_id`, and `model_id` MUST exactly match the
descriptor returned by `describe()`. The executor MUST NOT fall back to another
target. Provider/model identity is runtime selection and MUST NOT be copied into
a durable Prompt Definition.

### Capability negotiation

`capabilities.required` contains `text-generation`; every name MUST appear in
the descriptor. A missing required capability is a `capability-mismatch`
preflight error. `required` and `optional` MUST be disjoint.

Missing optional capabilities do not fail when the request's portable baseline
remains exact. The result MUST record `OPTIONAL_CAPABILITY_UNAVAILABLE`. If
absence changes required output, safety, validation, or classification behavior,
the capability was not truly optional and execution MUST fail.

Use of `seed` requires `seeded-generation` in `required`. JSON output with
provider constraint requirements uses `structured-output` in `required`;
provider-neutral parse/validate fallback under #68 may declare it optional.

### Portable generation parameters

The request `parameters` object is the entire portable parameter set. An
executor MUST reject a parameter absent from the descriptor or outside its
declared limits. It MUST NOT clamp or substitute a value.

| Field | Portable meaning |
| --- | --- |
| `max_output_tokens` | Hard requested ceiling on generated output tokens as counted by the target. Tokenizers vary, so counts are not cross-provider byte limits. |
| `temperature` | Sampling temperature in the closed domain 0–2. The exact distribution is provider-dependent; equal values do not promise equal randomness across targets. |
| `top_p` | Nucleus threshold in `(0, 1]`. Using it with temperature is allowed but SHOULD produce `MULTIPLE_SAMPLING_CONTROLS` because combined behavior is provider-dependent. |
| `stop_sequences` | Ordered unique literal strings that stop generation. An adapter MUST preserve exact strings/order and reject unsupported count/length. |
| `seed` | Non-negative safe integer hint. Requires `seeded-generation`; it never proves deterministic model output. |

If a supported parameter is omitted and the descriptor declares a default, the
executor applies that exact default before provider translation and records a
`PARAMETER_DEFAULT_APPLIED` warning naming the field. If no descriptor default
exists, omission leaves the provider behavior unspecified and SHOULD be avoided
in consequential work; provenance MUST preserve that fact.

### Expected output

Text output uses `text/plain` and validation `none`. JSON output uses
`application/json` and `json-syntax` or `json-schema`. `json-schema` requires a
complete immutable schema artifact reference. Issue #68 owns parsing,
validation, raw-versus-normalized retention, and any separately authorized
repair behavior. A provider's “JSON mode” claim is not a validation pass.

### Deadline and cancellation

`timeout_ms` is an explicit caller budget from adapter invocation start.
`cancellation_id` is a non-secret correlation identifier; the live cancellation
mechanism is passed out-of-band. Pre-aborted work returns `cancelled` without
provider contact. Expiry returns `timed-out`; partial/ambiguous provider action
MUST remain visible in restricted diagnostics when known.

### Delegation and observability

`delegation` records caller, accountable human owner, purpose, and a reader-safe
authority reference. These fields document an existing delegation; they cannot
create authority, approve content, cross an A4 gate, or authorize broader data.

`observability` selects `none`, `metadata-only`, or `restricted-content`
retention and separately declares prompt/output body capture. Capture is false
by default in policy even though all schema fields are explicit. Confidential or
restricted content capture requires `restricted-content` plus external access,
retention, deletion, and approval controls. Credentials and unnecessary bodies
MUST NOT enter logs, metrics, warnings, errors, or public provenance.

### Provider extensions

Extensions use exact namespaces and the same `required`/`fallback` envelope as
Prompt Definition v1. A required extension MUST use `reject`. Any extension with
`fallback: reject` fails when unsupported. An unknown optional
`portable-baseline` extension is ignored only when ignoring it preserves exact
core behavior; `omit` is only for advisory behavior whose absence cannot affect
output requirements, safety, classification, rights, or approval.

Extensions MUST NOT supply credentials, redefine a portable field, hide target
identity, weaken validation, grant data/tool authority, or trigger extra model
calls. Selected extension namespaces and material adapter behavior remain result
warnings and future provenance evidence.

## Execution result

### Status and output

`status` is one of `succeeded`, `failed`, `cancelled`, or `timed-out`.

- `succeeded` requires exactly one `output` and prohibits `error`.
- Every other status requires exactly one `error` and prohibits output. Partial
  provider content may be retained only as restricted diagnostic evidence.
- `cancelled` uses finish reason/category `cancelled`.
- `timed-out` uses finish reason `error` and category `timeout`.

An inline output contains a string plus its UTF-8 byte size and SHA-256 digest.
A referenced output contains a complete immutable artifact reference. The outer
output size/digest MUST match the inline content or referenced artifact.
`classification` MUST be at least the rendered prompt's classification and any
stricter provider/output policy class; execution never declassifies content.

JSON output content remains the exact provider text until #68 parsing and
validation. `succeeded` means the provider call normalized successfully; it does
not assert truth, quality, Canon, rights clearance, accessibility, safety, or
publication approval.

### Provider/model/adapter identity

Result `identity` MUST exactly match the descriptor actually used, including
adapter version and available model revision. Identity comes from runtime facts,
not model output or provider response content. A mismatch is an
`invalid-provider-response` normalization failure.

When the provider supplies a safe request identifier, the adapter preserves it
as `provider_request_id` on success or in error provider details on failure. It
is diagnostic/provenance correlation only and MUST NOT contain a credential or
be treated as proof of idempotency.

### Timing

`started_at` and `completed_at` are UTC/RFC 3339 timestamps recorded by the
executor boundary. `completed_at` MUST be no earlier than `started_at`.
`duration_ms` MUST equal their millisecond difference within the documented
monotonic-clock rounding tolerance; Platform v1 uses exact integer-millisecond
agreement in conformance tests. Provider timing may be retained separately but
MUST NOT replace executor timing without attribution.

### Usage

Usage values are non-negative normalized token counts. `provider_reported`
states whether the provider supplied them. If all three counts exist,
`total_tokens` MUST equal `input_tokens + output_tokens`. Missing counts remain
missing; an adapter MUST NOT fabricate zero. Token counts are target-specific
accounting evidence, not portable byte or cost measures.

### Finish reasons and warnings

Portable finish reasons are `stop`, `length`, `content-filter`, `cancelled`,
`error`, and `unknown`. Unknown provider reasons map to `unknown` and preserve
the raw safe code in restricted evidence. A content filter finish may still
produce a successful output if the provider returned an allowed final body, but
the caller MUST treat the warning/finish reason explicitly.

Warnings have stable uppercase codes, safe messages, and value-free structured
details. They record material loss/emulation, optional capability absence,
defaults, ambiguous provider behavior, or other non-fatal facts. Warnings cannot
turn a contract violation into success.

## Normalized error taxonomy

Every unsuccessful result has one category, stable adapter-independent code,
safe message, `retryable` decision, stage, and optional provider details.

| Category | Default retryable | Meaning / caller action |
| --- | --- | --- |
| `invalid-request` | No | Contract, integrity, parameter, delegation, or policy input failed; fix request. |
| `authentication` | No | Adapter credential rejected/missing; rotate or repair configuration through authorized operations. |
| `authorization` | No | Identity lacks provider/data/model permission; escalate access review. |
| `not-found` | No | Configured provider/model/resource absent; review target/version. |
| `capability-mismatch` | No | Descriptor cannot preserve a required capability/parameter/extension. |
| `rate-limit` | Conditional | Provider throttled; retry only under caller budget/idempotency and honor `retry_after_ms`. |
| `quota` | No | Account/project quota or budget exhausted; human/operations review required. |
| `content-policy` | No | Provider safety/policy rejected the request; do not evade by automatic rerouting. |
| `timeout` | Conditional | Deadline expired; retry only when prior action state and idempotency are safe. |
| `cancelled` | No | Caller/system cancelled intentionally. |
| `provider-unavailable` | Conditional | Provider service unavailable; bounded caller retry may be appropriate. |
| `transport` | Conditional | Network/protocol failed; ambiguity about provider action must remain explicit. |
| `invalid-provider-response` | Conditional | Response could not be normalized or identity was inconsistent. |
| `output-validation` | No | #68 validation failed; repair/retry requires a new authorized request. |
| `internal` | No | Executor/adapter invariant failed; contain and escalate. |

`retryable: true` is permitted only for `rate-limit`, `timeout`,
`provider-unavailable`, `transport`, or `invalid-provider-response`, and only
when the adapter has evidence that a caller-controlled retry can be sensible.
It is advice, not authorization. The executor performs no automatic retry.

`retry_after_ms` is allowed only when `retryable` is true. Provider details may
include safe code, HTTP status, request ID, and a restricted details reference.
They MUST NOT include credentials, request/response bodies, private context,
personal data, or raw headers. Unknown provider errors map honestly rather than
being misclassified to induce retry.

## Cross-document validation order

A conforming executor performs these steps without provider contact until step
9:

1. parse JSON without losing duplicate-key evidence;
2. validate request and descriptor schemas and semantic rules;
3. verify rendered-prompt canonical size/digest;
4. match request target to descriptor identity;
5. verify required/optional capabilities and execution mode;
6. materialize documented portable defaults and validate every parameter;
7. validate output expectation, classification/retention policy, deadline,
   delegation, and extensions;
8. stop on cancellation or preflight failure;
9. invoke the adapter at most once and enforce timeout/cancellation;
10. normalize success/error, compute output identity, validate result schema and
    semantic invariants, then return it;
11. emit provenance under #69 without changing the returned fact state.

A provenance-write failure cannot retroactively claim the provider was not
called. Consequential workflows fail closed and retain restricted recovery
evidence under #69.

## Security, privacy, rights, and accessibility

- Requests and descriptors contain no credential field. Adapters obtain secrets
  only from approved runtime configuration.
- Rendered prompts and outputs may be sensitive. Classification survives every
  translation; public records use safe identities or attestations.
- Model/provider output is untrusted and cannot provide authority, policy,
  provenance, Canon, rights, or approval.
- Extension configuration is untrusted data, never executable code.
- Provider data processing, retention, training, regional, subprocessors,
  accessibility, safety, and rights behavior require human review outside this
  schema before use.
- Fixtures are synthetic and contain no production prompt, private Lore,
  credentials, personal data, or provider response.

## Compatibility and extension points

The contract uses Semantic Versioning under [`VERSIONING.md`](VERSIONING.md).
Unknown core fields are rejected. Compatible additions require a new minor
version and consumer negotiation. Breaking field/status/category/semantic
changes require a new major version, migration guidance, side-by-side fixtures,
and a compatibility window.

Streaming, async jobs, media artifacts, multimodal parts, tools, and provider
routing use future contract kinds or namespaced extensions. Merely listing
`streaming` or `asynchronous` in a descriptor does not define their protocol.

## Producers and consumers

Known producers are Platform executors/adapters, approved SDK callers, and the
mock conformance adapter. Known consumers are Platform SDK/CLI, Build
Orchestrator, structured-output handling, provenance/observability, tests, and
audit/release tooling. Every consumer records the exact supported contract
version, capabilities, extension namespaces, and adapter descriptor identity.
