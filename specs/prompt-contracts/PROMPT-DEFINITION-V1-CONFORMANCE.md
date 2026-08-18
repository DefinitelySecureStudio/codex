# Prompt Definition Specification v1.0.0 conformance record

## Constitutional alignment

- Constitution: [Definitely Secure Studio Constitution v1.0.0](https://github.com/DefinitelySecureStudio/studio/tree/constitution/v1.0.0)
- Constitution tag: `constitution/v1.0.0`
- Constitution commit: [`a9cc8a503aa30e17820edc62ac95f7cbe10e0564`](https://github.com/DefinitelySecureStudio/studio/commit/a9cc8a503aa30e17820edc62ac95f7cbe10e0564)
- Status: `Conforming` (effective only after accountable-owner approval and merge of the adopting pull request)
- Subject: Prompt Definition Specification v1.0.0 candidate, RFC 0001, JSON Schema, versioning policy, and listed conformance fixtures
- Assessed revision: candidate diff from Codex commit `c105bbe177c80dea14fa7f10b8eda2aacdadeff6`; adopting merge commit recorded by the pull request
- Purpose/environment/audience: public implementation-neutral contract candidate for independent authors, validators, renderers, registries, SDKs, and audit tooling
- Assessed scope: the contract files named above and their agreement with Studio ADR 0016
- Excluded scope: renderer and semantic validator implementations; execution/adapter/registry/context/output/provenance contracts; production prompt definitions; immutable contract release, all assigned to Studio issues #63–#72
- Accountable owner: [`@andrewperis`](https://github.com/andrewperis), Codex maintainer and contract decision owner
- Reviewers: `@andrewperis` performs the A4 contract/governance review at merge; affected consumer review is required again before immutable release
- Assessment date: 2026-08-17
- Checklist revision: `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Applicable profiles: universal; ADR, RFC, and stable specification
- Evidence: [Studio issue #62](https://github.com/DefinitelySecureStudio/studio/issues/62), [Studio ADR 0016](https://github.com/DefinitelySecureStudio/studio/blob/main/adr/0016-prompt-sdk-architecture.md), [RFC 0001](../../rfcs/0001-prompt-definition-v1.md), [specification](prompt-definition-v1.md), [schema](../../schemas/json/prompt-contracts/v1/prompt-definition.schema.json), [versioning](VERSIONING.md), fixtures, and adopting pull request
- Evidence freshness: exact candidate diff and repository settings reviewed 2026-08-17; no production/provider evidence is claimed
- Active constitutional exceptions: None
- Residual risk: semantic cross-reference validation is specified but not automated until issue #64; the contract is accepted but unreleased and prohibited as a production dependency until issue #72
- Next review: before immutable v1 release; or earlier on Constitution, architecture, authority, field meaning, capability, extension, context/output reference, classification, rights, consumer, schema, or compatibility change

Before merge this is a proposed assessment and the contract remains under
review. Owner-approved merge makes the candidate assessment effective but does
not publish an immutable contract release. No sensitive evidence was needed.

## Findings

| ID | Severity | Disposition | Evidence |
| --- | --- | --- | --- |
| PD-1 | Major | Resolved in candidate | Provider-native messages and hidden interpolation were replaced by provider-neutral roles and typed literal/input/context parts. |
| PD-2 | Major | Resolved in candidate | The closed schema prohibits credentials/implicit reads, pins governance, declares classifications, and isolates namespaced extensions. |
| PD-3 | Minor | Resolved in candidate | Prompt and specification version axes, lifecycle, deprecation, immutable bytes, and breaking-change rules are explicit. |
| PD-4 | Advisory | Deferred by exact scope | Semantic validator automation, adapter capability enforcement, context integration, and immutable release have owned issues and cannot be claimed by this assessment. |

## Checklist evidence

`P` means Pass and `N/A` has the stated rationale. IDs follow the pinned
checklist order.

### Assessment identity

| ID | Result | Evidence or rationale |
| --- | --- | --- |
| I1 | P | Subject, base revision/candidate diff, purpose, public environment, audiences, scope, and exclusions are exact above. |
| I2 | P | Constitution version/tag/commit and checklist revision are pinned. |
| I3 | P | `@andrewperis` is the named contract owner and required CODEOWNER; affected consumers review again before release. |
| I4 | P | Profiles, evidence, date, freshness, status, findings, residual risk, and review triggers are recorded. |
| I5 | P | All evidence is reader-safe; the contract prohibits protected evidence in definitions and fixtures. |

### Universal profile

| ID | Result | Evidence or rationale |
| --- | --- | --- |
| U1 | P | Studio ADR 0016, Codex RFC/spec, owners, governance, and source references identify every authority and material input. |
| U2 | P | Codex owns contract meaning while Platform, Lab, Context Builder, Universe, Lore, and Studio retain their separate authority. |
| U3 | P | Definitions declare data/capability boundaries; runtime delegation, tools, budgets, and escalation remain required external execution-contract controls. |
| U4 | P | Governance records decision owner/evidence and states that metadata/model output cannot supply A4 approval. |
| U5 | P | Unknown fields/extensions, authority conflict, incompatible context, uncertain rights, and invalid evidence fail or escalate. |
| U6 | P | Definition lifecycle is explicit and separate from experiment, Canon, context, execution result, and release state. |
| U7 | P | The contract contains no Canon/Lore authority and consumes only named prepared context slots. |
| U8 | N/A | Prompt Definition v1 performs no Canon promotion, correction, deprecation, or retcon. |
| U9 | P | Definitions contain no context payload; classifications are declared and Context Builder authorization/expiry/integrity are runtime prerequisites. |
| U10 | P | Generated work must use exact definitions/context/output contracts; human purpose, audience, quality, and publication review remain external. |
| U11 | P | Definition identity/version, sources, owners, rights, exact contracts, inputs, extensions, and evidence are linked for downstream provenance. |
| U12 | P | The spec distinguishes schema facts, semantic rules, warnings, unknown/withheld evidence, model output, and human judgment. |
| U13 | P | Deterministic definition/render boundaries are separate from nondeterministic provider execution; no seed claim is made. |
| U14 | N/A | This contract produces no selected generation or release bytes; issues #69/#72 own preservation/release. |
| U15 | P | Immutable versions, stable references, Git review, source evidence, and future execution records establish attributable ordered audit paths. |
| U16 | P | Purpose, classifications, implicit-read prohibition, context boundary, failure modes, retention boundary, and security/privacy/rights owners precede use. |
| U17 | P | Closed declared inputs/context/capabilities/extensions minimize data, privilege, destinations, and hidden behavior. |
| U18 | P | No credential field exists; normative rules prohibit secrets in definitions, inputs, examples, fixtures, diagnostics, and evidence. |
| U19 | P | Classification follows inputs/context through rendering and execution evidence and cannot be silently discarded. |
| U20 | P | Provider use is absent from the definition; future adapters require reviewed capability/extension/data handling. |
| U21 | P | Provenance/rights require origin, sources, basis, review, notices, restrictions, and compatible use. |
| U22 | P | Provenance, permission, similarity, access, disclosure, or extension concern stops promotion/use and enters authorized review. |
| U23 | P | Structural acceptance and semantic rules are independent of producers and cover technical, security, rights, provenance, accessibility, and output needs. |
| U24 | P | Schema validation is explicitly bounded and cannot replace semantic, creative, contextual, rights, accessibility, or publication review. |
| U25 | P | Closed JSON, stable IDs/versions, published schema/fixtures, immutable artifacts, sizes/digests, and independent validation define durable control. |
| U26 | P | Provider-neutral capabilities and typed parts form the baseline; namespaced extensions require fallback, evidence, isolation, and clear failure. |
| U27 | P | SemVer, immutable bytes, side-by-side major schemas, mappings, consumer inventory, migration, compatibility window, and rollback preserve meaning. |

### ADR, RFC, and stable-specification profile

| ID | Result | Evidence or rationale |
| --- | --- | --- |
| A1 | P | RFC/spec belong to Codex and explicitly exclude implementation, Canon, Lore, context assembly, governance, and release authority. |
| A2 | P | RFC 0001 records context, alternatives, rationale, consequences/constraints, unresolved questions, owner, and exact Constitution reference. |
| A3 | P | Normative requirements are testable, provider-neutral, and separated from examples and adapter shapes. |
| A4 | P | Producers/consumers, compatibility, capabilities, versioning, lifecycle, deprecation, migration, fixtures, validation, failure, and rollback are addressed. |
| A5 | P | Security, privacy, rights, provenance, accessibility, portability, and failure behavior are normative rather than deferred. |
| A6 | P | The RFC defers constitutional meaning and cross-repository authority to Studio ADR/Constitution and claims no amendment power. |

### Assessment outcome

| ID | Result | Evidence or rationale |
| --- | --- | --- |
| O1 | P | PD-1 through PD-4 are classified; no unresolved Blocker or Major remains in assessed scope. |
| O2 | P | Effective candidate status is exactly `Conforming`; immutable release is separately pending and not implied. |
| O3 | P | Approval covers only the exact base revision plus candidate diff and does not cover future implementations or releases. |
| O4 | P | Material change, stale evidence, incident, amendment, and pre-release review triggers are explicit. |

## Approval

The accountable owner approves this assessment by reviewing and merging the
adopting Codex pull request. The merge records the candidate revision. Issue
#72 must create a fresh release assessment and immutable reference before any
production-stable claim.
