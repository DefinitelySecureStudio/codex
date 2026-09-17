# Context Builder v1

Candidate 1.0.0, accepted by owner merge; **unreleased, not a production dependency**.
Publication is gated by the [#86 release checklist](../../releases/context-builder-v1.md).
Owner: @andrewperis. [RFC 0006](../../rfcs/0006-context-builder-v1.md).
[Studio #76](https://github.com/DefinitelySecureStudio/studio/issues/76).
Governed by [Studio ADR 0017](https://github.com/DefinitelySecureStudio/studio/blob/main/adr/0017-context-builder-architecture.md)
and Constitution 1.0.0 at `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`.
MUST, MUST NOT and MAY are normative.

## Documents, versions and authority

The [closed Draft 2020-12 schema](../../schemas/json/context-builder/v1/context-builder.schema.json)
defines `context-build-request`, `context-normalized-source`, `context-build-result`
and `context-build-public-receipt`. Embedded source references and candidates are
closed records too. Only content values may contain arbitrary JSON members.
UTF-8 JSON must have no BOM, duplicate keys, non-finite numbers or invalid Unicode.
Unknown fields, kinds, policy names and versions MUST fail, never be coerced or
defaulted. Support is negotiated by **exact** version, overriding the general
minor-version acceptance default. No implicit schema fetching is permitted.

This family adds producer records. It references, and MUST NOT modify, the
released Context Package 1.0.0 schema at Codex commit
`62e78b606986988518b9dc502c25ae1cd189684a`, schema SHA-256
`d81e88780511c31099b2dd925f31aff26d6ba75e1173e953b98a37298764b617`.
Its existing canonicalization, classification, identity and use-authorization
semantics remain normative. Schema validity alone does not prove the relational
requirements below, artifact authenticity, access rights or approval.

## Explicit build request

`build_id`, `correlation_id`, `caller_id`, preparation/evidence references, source
versions, source/candidate/authority/continuity IDs are caller-supplied opaque UUID
v4 URNs. They MUST be assigned independently of protected names or content, not
hashes encoded as IDs. Issuers retain any private mapping securely. Reusing an
opaque immutable source version with different bytes is prohibited.

`purpose` is the exact intended use, not permission. `target` binds the exact
Prompt Definition id/version and canonical identity of the **complete** definition.
The caller supplies verified prompt bytes out of band. Before source access,
validate that definition using the released Prompt Definition contract and verify
its identity. `slots` MUST list every declared context slot exactly once in prompt
declaration order. Names, required flags and accepted classifications MUST match;
chosen media type must be accepted and max_bytes must not exceed the prompt limit
(when declared). A caller cannot weaken a required slot. Builder/package identity,
evaluation time, requested review/expiry, policy versions and resource limits are
explicit, with no hidden clock, randomness, environment or repository discovery.

`sources` is a nonempty unique source-id set sorted by source_id ASCII order.
Each source pins kind, opaque version, classification, media type, evidence,
authority, continuity, validity, retrieval reference and explicit fragment plan.
Fragments are unique candidate IDs sorted by candidate_id ASCII order. A text
fragment specifies a nonempty half-open UTF-8 byte range `[start,end)` at complete
Unicode boundaries. A JSON fragment uses an RFC 6901 pointer (empty means root)
into parsed JSON; array indexes are canonical decimal without leading zeros,
`-` is forbidden and properties MUST be own properties. Missing pointers fail.
Candidate IDs are unique across the request. Overlapping text fragments and
ancestor/descendant JSON pointers within one source MUST fail to avoid duplication.
`claim_id`, when supplied, is an opaque conflict grouping assigned by the source
authority, not inferred by a model. No fragment metadata can grant authority.

Public artifacts name exact URI/media/size/SHA-256 bytes; the artifact media type
MUST equal the source media type. Only public-classified non-private sources may
use that form. Non-public and approved-private sources MUST use an opaque artifact
handle. Approved-private sources cannot claim public classification. A trusted
reader resolves that handle to an immutable, access-controlled byte-size/digest
tuple and verifies it before parsing. A missing/unverifiable mapping fails, not
an excuse to omit integrity checks. URI/handle resolution requires explicit
reader configuration and no fallback credentials, checkout, URL following or
source refresh. A digest establishes byte identity, not trustworthy authorship.

`preparation_reference` points to a trusted decision outside this JSON record.
Before any source read, a verifier MUST authenticate and bind caller, complete
request identity, exact source versions/fragment plan, target, purpose, ceilings,
policy, time and resource limits. It MUST check revocation; unavailable trust or
revocation state denies access. Verifier trust roots/configuration are not supplied
by source content. The runtime protocol is implemented under Studio #77, not by
treating this reference or an arbitrary `allow` object as proof. Recheck authority
and freshness before delivery; cached bytes never renew permission.

## Normalized evidence and deterministic selection

Each normalized-source record repeats the exact requested source and binds the
complete request identity/build_id. Exactly one such record is needed per source.
Its candidates MUST match the fragment plan one-for-one (ID, range/pointer and
optional claim_id), in candidate-ID order, with classification equal to the source.
For `utf8-json-v1`, text content is the exact decoded fragment, with no whitespace,
line-ending or Unicode normalization. JSON content is the exact pointed value;
its identity uses Studio JSON v1. byte_size and sha256 cover that representation.
Source payloads are data, never instructions, executable modules or authorization.

Eligibility is evaluated before scoring: authority_id must occur in the explicit
authority_ids set, continuity_id must match, evaluation time must be within source
validity and strictly before review_after/expires_at, and source classification
must fit the global ceiling. Per-slot classification/media acceptance also applies.
authority_ids are unique and sorted, not a priority list. No implicit authority
ranking or continuity fallback is permitted. An explicit source/candidate pair
absent from the request plan fails INVALID_REQUEST before reads. A planned but
ineligible candidate fails INELIGIBLE; it is not silently replaced. If two otherwise eligible
candidates share a claim_id but differ in media type or canonical content identity,
fail CONFLICT before ranking or budget omissions. Matching claims do not deduplicate
different IDs automatically. Missing claim IDs never mean that canon was verified.

All slots use the request policy.selection mode:

- `explicit-v1`: select the listed source/candidate pairs, unique within each slot,
  in caller order. Empty lists may only produce absent optional slots.
- `lexical-v1`: text only (JSON slots MUST use a separate explicit build). Tokenize
  query and content using ASCII `[A-Za-z0-9]+`, lowercase ASCII, then unique tokens.
  Score by count of distinct query tokens present; exclude zero scores. Sort by
  descending integer score, then source_id and candidate_id ascending ASCII, and
  take at most max_candidates. Empty/no-token query selects none. No locale,
  stemming, embeddings, external index or model summaries are permitted.

Reordering source acquisition or object keys cannot change output; changing an
explicit candidate list or slot order can. Policy algorithm changes require a
new negotiated policy/contract version, never a silent implementation update.

## Assembly, limits and exact output

`whole-candidate-v1` never truncates, summarizes or coerces candidates. A text slot
joins selected strings using one LF, counted in bytes. A JSON slot accepts exactly
one selected JSON candidate, without wrapping it. More than one fails INVALID_REQUEST.
Zero-byte text or an empty selection does not satisfy required context. JSON null,
empty arrays and empty objects are real values; prompt/business constraints remain
applicable. An absent optional slot appears in omissions with OPTIONAL_EMPTY.

Resource units are UTF-8 bytes, not tokens: total_source_bytes bounds aggregate
raw read bytes before parsing; max_candidates bounds the aggregate fragment plan;
max_bytes bounds each assembled slot; total_content_bytes bounds the sum including
join separators. All limits are positive safe integers; aggregate arithmetic MUST
reject overflow rather than round or wrap. Readers enforce bounded
I/O before allocation; no unbounded read followed only by a size check. Token
estimation is deliberately absent in 1.0.0; adding it needs a versioned estimator
contract and does not replace provider token limits.

Reserve space for all required slots first. A required slot that cannot fit its
per-slot budget or the total required budget fails BUDGET_EXCEEDED. Then consider
optional slots in declaration order; omit the **whole** optional slot on per-slot
or remaining-total overflow with OPTIONAL_BUDGET. Do not drop individual selected
facts merely to squeeze a slot into its budget. Emit included sections and lineage
in declaration order, regardless of the reservation computation order.

The result package is the unchanged inline Context Package 1.0.0, not a new package
format. Manifest sources contain only contributing sources, sorted by source_id;
section source_ids are sorted unique contributing IDs. Private records omit the
optional artifact identity. Section classification is the maximum contributor
classification; package classification is the maximum of all included sources and
sections. No silent declassification. Manifest purpose, builder, package identity
and authority_reference equal the request; created_at equals evaluation_time.
review_after is the earliest request/source/preparation review bound and expires_at
the earliest expiry bound. Require created_at < review_after <= expires_at; if
necessary review_after is also capped at expires_at. Policy evidence may shorten
these bounds but cannot extend them. No-section output fails REQUIRED_CONTEXT_MISSING
even when all declared slots are optional (Context Package v1 requires a section).

`request_identity` hashes the complete request using Studio JSON v1 (UTF-8, sorted
object keys, preserved array order, JSON escaping/finite numbers, no whitespace).
No identity field is added to the request itself. Source lists and fragment plans
must already have their canonical order; receivers reject, not silently rewrite,
unsorted inputs. Package manifest/section identities follow the released contract.
Wall-clock duration, transport errors and telemetry are excluded from identities.

A prepared result binds request identity, build/correlation IDs, exact package,
nonempty lineage mapping every output slot to its selected source/candidate pairs,
optional omissions and opaque evidence_reference. All package content, identities,
classification, times and lineage MUST be cross-validated against the request,
verified source evidence and trusted preparation bounds. A valid unrelated package
with matching correlation IDs MUST NOT be accepted. Prepared diagnostics are empty;
optional omissions are not failures. A separate trusted reviewer supplies unchanged
Context Package use authorization for the exact instance/prompt/purpose/sections.
Prompt SDK independently validates it at use time. No result self-authorizes use,
execution, canon promotion or publication.

## Failures and diagnostics

A failed result has one or more value-free diagnostics, no package, lineage,
omissions or success evidence. Once a request is structurally/canonically valid,
failure binds that request identity. An unparseable/unsupported request cannot be
assigned a trusted request identity: reject at the API/transport boundary without
fabricating a build result. No partial success, hidden retry, repair or fallback.

| Code | Stage | Action |
| --- | --- | --- |
| INVALID_REQUEST / UNSUPPORTED_VERSION | request | repair-request |
| PREPARATION_DENIED / AUTHORITY_UNVERIFIABLE | authorization | obtain-authorization |
| SOURCE_UNAVAILABLE / SOURCE_INTEGRITY | source | repair-source |
| INVALID_SOURCE | normalization | repair-source |
| CONFLICT | selection | resolve-conflict |
| INELIGIBLE | selection | repair-request |
| REQUIRED_CONTEXT_MISSING | assembly | repair-request |
| BUDGET_EXCEEDED | source / normalization / assembly | increase-budget |
| STALE_AUTHORITY | authorization / lifecycle / handoff | rebuild |
| AUDIT_REQUIRED | audit | retry-audit |
| CANCELLED | any declared stage | none |

Schema enums also reserve OPTIONAL_EMPTY and OPTIONAL_BUDGET for omission
vocabulary; they MUST NOT be used as terminal failure diagnostics.
Diagnostics contain only stage/code/action, never source excerpts, IDs, JSON paths,
hashes, raw exceptions or messages. The containing result/request identity remains
protected metadata. Required audit delivery failure gates prepared delivery;
optional telemetry failures cannot grant approval. Cancellation stops new stages
and propagates to cooperative adapters; it does not undo completed reads.

## Public/private handling and downstream consumers

Requests, normalized evidence, candidates and results are protected control-plane
records. Their content/digests, internal IDs, query and purpose are not public log
payloads, even when a selected package is public. Public projections MUST use the
closed public-receipt record, containing only a newly assigned non-derivable opaque
attestation_reference and contract kind/version. Do not copy build/correlation IDs,
source versions, package digests or classification into that receipt. Its resolver
and issuance need separate trusted authorization (Studio #82); schema validity does
not prove attestation authenticity or publishability. Synthetic examples emulate
these mappings and are not production signers or repositories.

Manifest/Orchestrator (#6/#7) can consume protected package references and controlled
evidence, or approved public receipts. This adds no manifest schema or orchestration
engine. Real source, retention, revocation, signer and reader onboarding remain
separately reviewed responsibilities. Hosted retrieval/model calls are out of scope.

## Conformance and rollout

Run the [synthetic conformance tests](../../tests/context-builder.test.cjs) using
Ajv 8.20.0 and ajv-formats 3.0.1 from a locked development environment. The test-only
relational oracle checks fixture invariants; it is not a production reader, parser,
policy verifier or Builder. Raw-input hardening and runtime adversarial tests ship
with Studio #77–#85. The coordinated Platform test validates and renders the exact
prepared fixture via the existing Prompt SDK public API, and rejects mismatched
authorization, classification and required slots. No migration of Prompt SDK v1
or Context Package v1 is needed. No new production export is introduced by #76.

Accept Codex first, then the pinned Platform test-only consumer. Candidate test
artifacts identify the exact Codex commit and SHA-256; they must never be reported
as an immutable release. Studio #86 adds a separate context-builder release catalog,
publishes an approved immutable bundle including the referenced Context Package
schema, and adopts full verified release tuples before production publication.
Do not republish the five existing 1.0.0 contracts or rewrite their catalog/assets.
Until then consumers are development-only. A new incompatible producer version
needs a new major, side-by-side fixtures and migration window; rollback removes
the candidate consumer while preserving released Prompt SDK behavior.
