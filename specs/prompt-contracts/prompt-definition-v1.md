# Prompt Definition Specification v1.0.0

- Status: Accepted upon owner-approved merge; release pending Studio issue #72
- Version: 1.0.0
- Owners: Definitely Secure Studio Codex maintainers (`@andrewperis`)
- RFC: [RFC 0001](../../rfcs/0001-prompt-definition-v1.md)
- Schema: [`prompt-definition.schema.json`](../../schemas/json/prompt-contracts/v1/prompt-definition.schema.json)
- Replaces: None
- Constitution version: 1.0.0
- Constitution tag: `constitution/v1.0.0`
- Constitution commit: `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Applicable checklist profile: ADR, RFC, and stable specification
- Conformance evidence: [`PROMPT-DEFINITION-V1-CONFORMANCE.md`](PROMPT-DEFINITION-V1-CONFORMANCE.md)

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**,
and **MAY** describe normative requirements.

## Purpose

A Prompt Definition v1 document is the complete, portable, provider-neutral
description of one version of a Studio prompt. It defines identity, intended
use, declared data dependencies, ordered message content, capability needs,
output expectation, provenance, rights, governance evidence, and compatible
extension behavior.

The contract enables an independent implementation to inspect, validate, and
render a prompt without a provider SDK, network service, repository checkout,
environment read, private creative source, or Platform implementation detail.

This contract does not define rendered prompts, execution requests/results,
provider adapter APIs, registries, context-package contents, or execution
provenance. Those are separate contracts under Studio issues #63 through #69.

## Normative representation

A definition MUST be UTF-8 JSON conforming to the linked JSON Schema. It MUST
not contain a byte-order mark. Object member order is not significant; array
order is significant. Duplicate object member names are invalid even if a JSON
parser would accept them.

Every object is closed unless this specification explicitly says otherwise.
Unknown fields MUST be rejected. Extensible behavior belongs only in the
top-level `extensions` object.

JSON Schema validation establishes structural conformance only. Semantic
validation MUST additionally enforce the cross-reference, constraint,
capability, classification, and policy rules in this document.

## Top-level fields

| Field | Required | Meaning |
| --- | --- | --- |
| `spec_version` | Yes | Exact Prompt Definition Specification version; v1.0 documents use `1.0.0`. |
| `id` | Yes | Stable prompt identity, independent of version, registry, provider, repository path, and display name. |
| `version` | Yes | Semantic version of this prompt definition. |
| `name` | Yes | Short human-readable display name. |
| `description` | Yes | Reader-safe description of what the definition contains. |
| `purpose` | Yes | Intended decision or production use and its material non-goals. |
| `owners` | Yes | One or more accountable maintained identities. |
| `lifecycle` | Yes | Draft/experimental/stable/deprecated/retired state and any deprecation record. |
| `tags` | No | Unique lowercase discovery labels with no authority effect. |
| `inputs` | Yes | Complete declaration of runtime values the template may reference. May be empty. |
| `context_slots` | Yes | Complete declaration of prepared Context Builder values the template may reference. May be empty. |
| `template` | Yes | Provider-neutral ordered message and typed-part structure. |
| `capabilities` | Yes | Required and optional provider-neutral execution capabilities. |
| `output` | Yes | Expected output kind, media type, description, and optional approved schema reference. |
| `provenance` | Yes | Definition origin, source references, creator identity, and rights record. |
| `governance` | Yes | Exact Constitution reference, human decision owner, and reader-safe evidence. |
| `extensions` | No | Explicit namespaced non-core behavior with requirement and fallback disposition. |

## Identity and metadata

### `spec_version`

`spec_version` MUST be `1.0.0` for this schema. A consumer MUST select and
verify the matching immutable schema; it MUST NOT interpret a version range as
the document's governing specification.

### `id`

A prompt ID has this form:

```text
prompt.<namespace>.<name>
```

Each segment uses lowercase ASCII letters, digits, and internal hyphens. The ID
MUST contain at least a namespace and name after `prompt`, for example
`prompt.reference.summarize-public-text`. IDs are allocated once and MUST NOT be
reused for a different purpose. Moving a file, registry, or implementation MUST
NOT change the ID.

### `version`

`version` MUST be a valid Semantic Version. It identifies this prompt's
contract and intended behavior independently of `spec_version`. Released bytes
are immutable and follow [`VERSIONING.md`](VERSIONING.md).

### Human-readable metadata

`name`, `description`, and `purpose` MUST be reader-safe. `purpose` MUST state
the intended use precisely enough to determine whether a caller is expanding
scope. It SHOULD name material exclusions, audience, and required human review.

`owners` MUST contain at least one maintained human or team identity with a
named decision owner in repository evidence. An owner entry does not grant
runtime access or A4 approval by itself.

`tags` are discovery hints only. A tag MUST NOT change capability,
classification, lifecycle, routing, or policy behavior.

## Lifecycle

`lifecycle.status` is one of:

| Status | Meaning |
| --- | --- |
| `draft` | Incomplete proposal; not an accepted dependency or production input. |
| `experimental` | Safe-data evaluation artifact; not a stable dependency. |
| `stable` | Accepted and immutably released for its declared consumers. |
| `deprecated` | Still resolvable during a dated support window but not recommended for new use. |
| `retired` | Unavailable for new execution; retained only for audit/reproduction under policy. |

`stable` MUST NOT be used until the exact definition and governing contract are
released. `deprecated` and `retired` MUST include `lifecycle.deprecation` with:

- `deprecated_at`: ISO 8601 timestamp;
- `reason`: reader-safe rationale;
- `support_until`: ISO 8601 timestamp no earlier than `deprecated_at`;
- `replacement`: exact prompt ID and version when a replacement exists; and
- `no_replacement_reason`: REQUIRED when no replacement exists.

Exactly one of `replacement` and `no_replacement_reason` MUST be present.
Registries MUST NOT silently resolve a deprecated or retired version to its
replacement.

## Inputs

Each `inputs` item declares one value using:

| Field | Required | Meaning |
| --- | --- | --- |
| `name` | Yes | Lowercase snake-case symbol unique across inputs. |
| `description` | Yes | Intended meaning, provenance expectations, and safe-use boundary. |
| `type` | Yes | `string`, `integer`, `number`, `boolean`, `object`, or `array`. |
| `required` | Yes | Whether the caller must supply the value. |
| `classification` | Yes | Maximum declared class: `public`, `internal`, `confidential`, or `restricted`. |
| `constraints` | No | Portable bounds applied before rendering. |
| `default` | No | Literal default for an optional input only. |

Input names MUST be unique. Input values MUST be supplied explicitly by the
caller or, for an optional input, by the declared literal `default`. A renderer
MUST NOT obtain a value from an environment variable, secret manager,
filesystem, network, clock, random source, previous conversation, model output,
or undeclared context.

A required input MUST NOT have a default. Defaults MUST contain no credential,
private context, personal data, mutable provider identifier, or undeclared
external reference. Object and array defaults MUST be represented directly as
JSON values.

### Portable constraints

The `constraints` object may express:

- `enum`: allowed JSON scalar values;
- `min_length`, `max_length`, and `pattern` for strings;
- `minimum` and `maximum` for numbers/integers; and
- `min_items` and `max_items` for arrays.

Semantic validation MUST reject a constraint that does not apply to the input
type, contradictory bounds, duplicate enum values, and a default that violates
its declaration. `pattern` uses the ECMA-262 regular-expression dialect without
implementation-specific flags. Constraints validate data; they MUST NOT run
code or read external state.

`classification` constrains handling and does not authorize the caller to
supply that class. Runtime policy MAY impose a stricter class or prohibit a
value. A renderer MUST preserve the effective classification in its result and
provenance boundary.

## Context slots

`context_slots` declares prepared context dependencies without containing the
context. Each slot uses:

| Field | Required | Meaning |
| --- | --- | --- |
| `name` | Yes | Lowercase snake-case symbol unique across context slots. |
| `description` | Yes | Intended context purpose and exclusions. |
| `required` | Yes | Whether an explicit compatible value must be supplied. |
| `accepted_classifications` | Yes | Non-empty set of classes permitted by the prompt contract. |
| `accepted_media_types` | No | Allowed portable media types; absence uses the context integration contract's text default. |
| `max_bytes` | No | Maximum verified payload bytes accepted by this prompt before rendering. |

Context slot names MUST be unique and MUST NOT duplicate an input name. A
definition declares placement and constraints only. It MUST NOT contain a Lore
path, retrieve a source, assemble a package, renew approval, declassify content,
or embed a runtime payload.

The caller supplies an explicit [Context Package v1](../context-packages/context-package-v1.md)
package/reference and matching authorization decision. Runtime validation MUST
check contract version, identity, integrity, classification, authorization,
expiry/review, media type, and size before rendering. Missing or incompatible
required context fails closed. Optional context omission produces no part
content and remains explicit in provenance.

## Template

`template.format` MUST be `studio-messages-v1`. `template.messages` is a
non-empty ordered array. Each message has one provider-neutral role:

- `instruction`: Studio/caller-authored instruction that constrains the task;
- `user`: caller-facing task content or request; or
- `assistant-example`: an explicitly non-authoritative example of expected
  response style or structure.

These are Studio roles, not a promise that a provider exposes identical roles.
Adapters map them under the execution contract and record any material loss.

Each message contains a non-empty ordered `parts` array. V1 defines three part
types:

### Literal text part

```json
{ "type": "text", "text": "Summarize the supplied public text." }
```

`text` is literal UTF-8 content. It has no placeholder, escape, include,
expression, or directive semantics. Text MUST NOT contain committed secrets or
private production context.

### Input reference part

```json
{ "type": "input", "name": "source_text", "format": "text" }
```

`name` MUST reference exactly one declared input. `format` is `text` or `json`
and defaults semantically to `text` when omitted. `text` formatting accepts
string, number, integer, or boolean and uses the renderer's normative scalar
representation. `json` formatting accepts any declared type and uses the
canonical JSON algorithm selected under issue #63. A renderer MUST reject a
format/type combination it cannot represent; it MUST NOT call `toString()` or
an equivalent implementation-defined formatter silently.

### Context reference part

```json
{ "type": "context", "slot": "approved_context", "format": "text" }
```

`slot` MUST reference exactly one declared context slot. `format` is `text` or
`json` and defaults semantically to `text`. The context integration contract
defines compatible content and canonicalization. A renderer MUST preserve
classification/provenance outside the message bytes and MUST NOT broaden,
summarize, truncate, or reorder context unless a later explicit contract and
authorization permit it.

Every declared required input and context slot SHOULD be referenced. An
unreferenced declaration produces a lint warning; an undeclared reference is an
error. Empty literal text, duplicate adjacent context injection, and an
`assistant-example` containing policy/authorization claims SHOULD be linted.

## Capability requirements

`capabilities.required` is a non-empty unique array and MUST include
`text-generation` in v1. `capabilities.optional` is a unique array disjoint from
`required`.

Capability names are lowercase hyphenated identifiers, optionally namespaced
with dots. Core v1 reserves:

- `text-generation`: synchronous ordered-message text execution; and
- `structured-output`: adapter support for an output schema or equivalent
  constrained JSON response.

Other names are declarations only until a released Codex contract defines
their semantics. A provider or adapter name MUST NOT masquerade as a core
capability. A required unsupported or ambiguous capability fails before
execution. Optional capability absence MUST preserve the portable baseline and
be recorded.

When `output.kind` is `json`, `structured-output` MUST appear in either
`required` or `optional`. Declaring it optional means the caller permits
provider-neutral parse-and-validate behavior without a provider-native response
mode; it does not permit skipping validation.

## Output declaration

`output` contains:

| Field | Required | Meaning |
| --- | --- | --- |
| `kind` | Yes | `text` or `json`. |
| `media_type` | Yes | `text/plain` for text or `application/json` for JSON. |
| `description` | Yes | Expected semantics, audience, quality, and material exclusions. |
| `schema` | No | Complete stable reference to an approved JSON output schema; allowed only for JSON. |

An output schema reference contains `schema_id`, `repository`, `contract`,
`version`, immutable `tag`, full `commit`, `artifact_uri`, `media_type`, positive
`byte_size`, and lowercase `sha256:` digest. Consumers MUST verify size/digest
before using it and MUST NOT substitute a branch, range, copied schema, or
unverified registry object.

JSON output without `schema` declares syntactically valid JSON only. JSON output
with `schema` declares parse and schema validation. [Structured Output
v1](../structured-output/structured-output-v1.md) defines raw versus normalized
result handling and failure behavior. A parse or validation failure
MUST remain explicit; missing values MUST NOT be fabricated.

The output description does not grant truth, Canon, rights, accessibility,
security, or publication approval. Qualified humans and downstream gates review
those concerns against the actual output.

## Provenance and rights

`provenance` contains:

- `origin`: `studio-original`, `promoted-experiment`, `derived`, or
  `third-party`;
- `created_by`: maintained human/team identity responsible for the definition;
- `created_at`: ISO 8601 timestamp;
- `source_references`: reader-safe immutable URLs or stable identifiers; and
- `rights`: rights basis, reviewer, review time, required notices, and optional
  restrictions.

`promoted-experiment`, `derived`, and `third-party` origins MUST have at least
one exact source reference. A Lab source is promotion lineage, never a runtime
dependency. `third-party` or `derived` content MUST identify permission and
compatible intended uses in `rights.restrictions` or linked evidence.

Rights bases are `studio-original`, `licensed`, `public-domain`, or
`approved-public`. The field records a reviewed basis; it is not a license grant.
Questionable provenance, permission, similarity, or rights stops promotion and
uses the authorized review path.

Notices MUST contain only distributable reader-safe text or URLs. Private
contracts, personal data, unpublished material, and restricted evidence do not
belong in the definition.

## Governance

`governance.constitution` MUST identify the exact Constitution version, tag,
and full commit used to assess the prompt. For the v1 baseline these are:

```text
version: 1.0.0
tag: constitution/v1.0.0
commit: a9cc8a503aa30e17820edc62ac95f7cbe10e0564
```

`governance.decision_owner` names the accountable human or maintained team with
a named human decision owner. `governance.evidence` contains one or more
reader-safe absolute URLs to the assessment, issue, pull request, or approved
non-derivable attestation.

Governance metadata does not self-approve a definition. A4 creative, Canon,
publication, security/privacy/rights, disclosure, access, and governance
decisions require the authorized human to review the actual evidence.

## Extensions

`extensions` is an object keyed by a lowercase reverse-domain-style namespace
with at least one dot, such as `example.provider-feature`. Core Studio fields do
not use this object.

Each extension contains:

- `required`: whether execution without this extension is prohibited;
- `fallback`: `reject`, `portable-baseline`, or `omit`;
- `configuration`: the extension-owned JSON object; and
- `evidence`: optional reader-safe review/provenance URLs.

Rules:

1. An unknown required extension MUST fail validation or capability negotiation.
2. `required: true` MUST use `fallback: reject`.
3. `portable-baseline` means ignoring the configuration preserves the exact
   core contract; it MUST NOT silently approximate extension semantics.
4. `omit` is allowed only for optional advisory behavior whose absence cannot
   change required output, safety, classification, rights, or approval.
5. Extensions MUST NOT redefine a core field, supply credentials, weaken
   validation, hide provider/model identity, authorize data/tool access, or
   force unrelated definitions onto a provider.
6. Material provider extensions require the dependency/exit evidence and human
   approval required by Studio policy.

## Producers, consumers, and failure behavior

Known producers are Lab promotion tooling and approved prompt authoring/registry
workflows. Known consumers are Platform validator, renderer, registry, CLI,
executor, Build Orchestrator, and audit/release tooling. A consumer MUST declare
the exact Prompt Specification versions and extension namespaces it supports.

Structural invalidity, duplicate JSON keys, unknown fields, duplicate symbols,
undeclared references, invalid constraints/defaults, classification mismatch,
capability/output contradiction, unknown required extension, or invalid stable
reference is a hard validation error. A consumer MUST NOT render or execute the
definition after such an error.

Warnings may cover unused optional declarations, deprecated versions, missing
recommended metadata, optional capability/extension absence, or accessibility
and quality concerns that require human review. A warning MUST NOT be promoted
to `Pass` silently in a consequential workflow.

Diagnostics are structured under issue #64. This specification does not assign
provider retries, execution recovery, or output repair; callers and later
contracts own those actions.

## Security, privacy, accessibility, and portability

- Definitions MUST contain no credentials, private context packages, raw
  production prompts, personal data, confidential communications, or
  unpublished Canon/Lore.
- Public examples and fixtures MUST be synthetic, licensed, or already public.
- Model/provider output is untrusted and cannot provide authority or policy.
- Input/context classifications MUST survive rendering and execution evidence.
- A definition MUST NOT authorize access to a value merely by declaring it.
- Purpose and output descriptions SHOULD state accessibility and audience needs;
  automated structure checks do not replace human accessibility review.
- Independent implementations MUST be able to parse and validate the JSON
  document using the released schema and fixtures without a provider call.
- Provider-specific behavior MUST remain isolated in explicit extensions and
  Platform adapters with a portable baseline or clear failure.

## Conformance

A structurally conforming v1 document:

1. parses as duplicate-free UTF-8 JSON;
2. validates against the exact v1.0.0 JSON Schema; and
3. passes every semantic rule in this specification.

The fixtures under `fixtures/valid/prompt-contracts/v1/` MUST pass and those
under `fixtures/invalid/prompt-contracts/v1/` MUST fail for their documented
reason. Schema validation alone MUST NOT be described as full Prompt Definition
conformance until issue #64 implements and tests the semantic rules.

Before production consumption, the contract bundle and each stable prompt
definition are immutably released, content-addressed, and recorded through the
complete stable reference tuple. Until Studio issue #72 publishes the bundle,
this merged contract remains accepted but unreleased and MUST NOT be claimed as
a production-stable dependency.
