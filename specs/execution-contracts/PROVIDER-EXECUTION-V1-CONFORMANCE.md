# Provider Execution Contract v1.0.0 conformance record

## Constitutional alignment

- Constitution: [Definitely Secure Studio Constitution v1.0.0](https://github.com/DefinitelySecureStudio/studio/tree/constitution/v1.0.0)
- Constitution tag: `constitution/v1.0.0`
- Constitution commit: [`a9cc8a503aa30e17820edc62ac95f7cbe10e0564`](https://github.com/DefinitelySecureStudio/studio/commit/a9cc8a503aa30e17820edc62ac95f7cbe10e0564)
- Status: `Conforming` (effective only after accountable-owner approval and merge of the adopting pull request)
- Subject: Provider Execution Contract v1.0.0 candidate, RFC 0002, JSON Schema, versioning policy, and listed conformance fixtures
- Assessed revision: candidate diff from Codex commit `bd31b6249e068d3317306afb857d68024f2929be`; adopting merge commit recorded by the pull request
- Purpose/environment/audience: public implementation-neutral contract candidate for Platform SDK/executor/adapters, Build Orchestrator, conformance tooling, and audit/provenance consumers
- Assessed scope: descriptor/request/result contract, capability/parameter/extension model, synchronous semantics, error taxonomy, schema, fixtures, and agreement with Studio ADR 0016
- Excluded scope: Platform implementation; real provider selection/SDK/credentials; registry, context-package, structured-output, and provenance implementations; streaming/async/media/tool contracts; immutable release
- Accountable owner: [`@andrewperis`](https://github.com/andrewperis), Codex maintainer and contract decision owner
- Reviewers: `@andrewperis` performs A4 contract/governance review at merge; Platform consumer and provider-specific reviews are required independently
- Assessment date: 2026-08-19
- Checklist revision: `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Applicable profiles: universal; ADR, RFC, and stable specification; agent and automated workflow
- Evidence: [Studio issue #65](https://github.com/DefinitelySecureStudio/studio/issues/65), [Studio ADR 0016](https://github.com/DefinitelySecureStudio/studio/blob/main/adr/0016-prompt-sdk-architecture.md), [RFC 0002](../../rfcs/0002-provider-execution-v1.md), [specification](provider-execution-v1.md), [schema](../../schemas/json/execution-contracts/v1/provider-execution.schema.json), [versioning](VERSIONING.md), synthetic fixtures, and adopting pull request
- Evidence freshness: exact candidate diff and repository settings reviewed 2026-08-19; no production/provider evidence is claimed
- Active constitutional exceptions: None
- Residual risk: the contract is accepted but unreleased; Platform conformance is separate; real providers require security/privacy/rights/terms/retention/region review; streaming/async/output/provenance behavior remains deferred
- Next review: before immutable v1 release or any real provider enablement; earlier on Constitution, architecture, authority, capability/parameter/extension/error meaning, retry/routing, protected-data, provider, schema, consumer, or compatibility change

Before merge this is a proposed assessment. Owner-approved merge makes the
candidate assessment effective but does not publish an immutable contract or
approve a real provider. No sensitive evidence was needed.

## Findings

| ID | Severity | Disposition | Evidence |
| --- | --- | --- | --- |
| PE-1 | Major | Resolved in candidate | Provider SDK/native request types are isolated behind a Studio-owned descriptor/request/result boundary with exact runtime identity. |
| PE-2 | Major | Resolved in candidate | Preflight capability/parameter/extension negotiation fails before contact and prohibits silent clamp, fallback, retry, reroute, or extra calls. |
| PE-3 | Major | Resolved in candidate | Errors separate permanent faults from conditional retry candidates while preserving safe provider codes/request IDs and forbidding secret/body leakage. |
| PE-4 | Major | Resolved in candidate | Delegation, idempotency, timeout/cancellation, classification, observability, and one-call semantics are explicit and cannot self-authorize. |
| PE-5 | Advisory | Deferred by exact scope | Real-provider review, Platform implementation, output validation, provenance, immutable release, and streaming/async/media/tool protocols retain owned follow-up issues. |

## Checklist evidence

`P` means Pass and `N/A` has the stated rationale. IDs follow the pinned
checklist order.

### Assessment identity

| ID | Result | Evidence or rationale |
| --- | --- | --- |
| I1 | P | Subject, candidate base/diff, public environment, audiences, scope, and exclusions are exact. |
| I2 | P | Constitution version/tag/commit, contract version, schema ID, and checklist revision are pinned. |
| I3 | P | `@andrewperis` owns contract review; Platform and real-provider reviewers remain independent gates. |
| I4 | P | Profiles, evidence, date, freshness, findings, residual risk, and review triggers are explicit. |
| I5 | P | Evidence/fixtures are reader-safe; protected provider/runtime evidence is represented only by restricted references. |

### Universal profile

| ID | Result | Evidence or rationale |
| --- | --- | --- |
| U1 | P | Studio ADR, RFC/spec, descriptor/request identity, delegation, and owners identify authorities and material sources. |
| U2 | P | Codex owns portable meaning; Platform/provider/caller/Studio/Universe/Lore/Context Builder retain their distinct authority. |
| U3 | P | Request bounds target, capabilities, parameters, extensions, purpose, timeout, cancellation, observability, and one call; outer workflow owns retry/routing. |
| U4 | P | Delegation records an existing owner/reference and cannot create A4 approval; model/provider output is never authority. |
| U5 | P | Integrity, identity, capability, parameter, extension, policy, ambiguity, or invariant failure stops or escalates explicitly. |
| U6 | P | Descriptor/request/result/provenance/release/Canon states are distinct; success does not imply truth/quality/approval. |
| U7 | P | Contract neither reads nor changes Canon/Lore and accepts only an already-rendered explicit prompt. |
| U8 | N/A | Provider execution cannot promote, correct, deprecate, or retcon Canon. |
| U9 | P | Classification survives request/result; context identities are value-free; body capture requires an approved restricted boundary. |
| U10 | P | Nondeterministic output is proposed work requiring downstream human quality/creative/publication review. |
| U11 | P | Prompt digest, target identity, exact parameters/extensions, timing, usage, output digest, and error/provider facts support later provenance. |
| U12 | P | Schema facts, adapter declarations, warnings, unknown finish/error facts, model output, and human judgment remain distinct. |
| U13 | P | Seed is explicitly a hint; exact input/target/parameter identity is preserved without a reproducibility guarantee. |
| U14 | N/A | This contract defines identities but selects/releases no output bytes; #69/#72 own preservation and release. |
| U15 | P | Stable execution/idempotency/correlation IDs, ordered stages, timestamps, provider request IDs, warnings, and errors create an attributable path. |
| U16 | P | Preflight, identity, cancellation, ambiguity, retention, credentials, raw evidence, and failure recovery are specified before implementation. |
| U17 | P | One exact target/call, explicit controls, minimal capture, closed fields, and no hidden retry/routing enforce least privilege/minimization. |
| U18 | P | No credential field exists; errors/warnings/provider details exclude secrets, raw headers, bodies, context, and personal data. |
| U19 | P | Request/output classification and retention/capture rules prevent silent declassification. |
| U20 | P | Real provider enablement requires separate technical, terms, privacy, security, retention/training/region, rights, accessibility, and exit review. |
| U21 | P | Provider/extension/third-party behavior requires compatible rights/terms review; fixtures are Studio-original synthetic data. |
| U22 | P | Access, disclosure, provider-policy, rights, identity, or ambiguous-action concern stops automatic continuation and enters authorized review. |
| U23 | P | Schema, semantic fixtures, mock adapter, cross-document negotiation, and failure cases are independent of any provider producer. |
| U24 | P | Contract/schema success cannot approve creative quality, truth, safety, rights, accessibility, Canon, publication, or retry. |
| U25 | P | Closed JSON, SemVer, exact identities/digests, schemas/fixtures, and future immutable bundle avoid provider/host lock-in. |
| U26 | P | Text-first portable baseline, explicit native/emulated capability, extensions/fallbacks, identity, and exit behavior isolate provider features. |
| U27 | P | Breaking changes require new major, side-by-side contracts, migration, consumer inventory, compatibility window, rollback, and immutable old results. |

### ADR, RFC, and stable-specification profile

| ID | Result | Evidence or rationale |
| --- | --- | --- |
| A1 | P | Contract belongs to Codex and excludes implementation, provider selection, governance, Canon/Lore, and release authority. |
| A2 | P | RFC records motivation, decision, alternatives, consequences, constraints, unknowns, owner, and exact Constitution/ADR references. |
| A3 | P | Descriptor/request/result, negotiation, parameters, statuses, errors, retry rules, and order are testable and provider-neutral. |
| A4 | P | Producers/consumers, versioning, negotiation, migration, fixtures, validation, failure, deprecation, rollout, and rollback are covered. |
| A5 | P | Security/privacy/rights/provenance/accessibility/portability and failure behavior are normative and bounded. |
| A6 | P | Constitutional/cross-repository authority remains in Studio; this RFC claims no amendment or self-approval power. |

### Agent and automated-workflow profile

| ID | Result | Evidence or rationale |
| --- | --- | --- |
| G1 | P | Request declares caller/owner/purpose/authority, target, data identity/classification, controls, timeout/cancellation, and observability. |
| G2 | P | Executor enforces schema, integrity, identity, capability, parameter, extension, classification, and policy outside model output. |
| G3 | P | Adapter/model cannot grant authority, retry/reroute, cross A4 gates, approve content, or change Canon/publication state. |
| G4 | P | Request/result capture exact call identity, target, controls, timing, usage, warnings, errors, provider details, and later provenance linkage. |
| G5 | P | Taxonomy and semantics cover timeout, cancellation, rate limit, provider/transport ambiguity, invalid response, retry containment, and human escalation. |

### Assessment outcome

| ID | Result | Evidence or rationale |
| --- | --- | --- |
| O1 | P | PE-1 through PE-5 are classified; no unresolved Blocker or Major remains in assessed scope. |
| O2 | P | Effective candidate status is `Conforming`; immutable release/provider approval is not implied. |
| O3 | P | Approval covers only the exact base revision plus issue #65 Codex candidate diff. |
| O4 | P | Pre-release/provider/material-change/incident/amendment/staleness triggers are explicit. |

## Approval

The accountable owner approves this exact assessment by reviewing and merging
the Codex pull request. Platform performs an independent implementation
assessment. Issue #72 performs a fresh release assessment before production use.
