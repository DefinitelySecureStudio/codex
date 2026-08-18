# RFC 0001: Prompt Definition Specification v1

- Status: Accepted upon owner-approved merge; unreleased until the Prompt SDK v1 release
- Authors: `@andrewperis`
- Created: 2026-08-17
- Contract family: Prompt contracts
- Compatibility: New contract
- Supersedes: None
- Superseded by: None
- Constitution version: 1.0.0
- Constitution tag: `constitution/v1.0.0`
- Constitution commit: `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Applicable checklist profile: ADR, RFC, and stable specification
- Conformance evidence: [`PROMPT-DEFINITION-V1-CONFORMANCE.md`](../specs/prompt-contracts/PROMPT-DEFINITION-V1-CONFORMANCE.md)
- Decision owner and required A4 reviewer: `@andrewperis`
- Studio architecture: [ADR 0016](https://github.com/DefinitelySecureStudio/studio/blob/main/adr/0016-prompt-sdk-architecture.md)
- Related issue: [Studio #62](https://github.com/DefinitelySecureStudio/studio/issues/62)

## Summary

Adopt Prompt Definition Specification v1.0.0 as the provider-neutral portable
document for one versioned Studio prompt. A definition uses typed message parts
for literal text, declared inputs, and named context slots. It declares
identity, ownership, lifecycle, capabilities, output expectations, provenance,
rights, and exact governance evidence without containing credentials, private
runtime context, provider-native request objects, or executable template code.

The specification, JSON Schema, versioning rules, and synthetic fixtures become
accepted Codex contract candidates when this RFC merges. They do not become a
released production dependency until packaged and published immutably under the
Codex release policy in Studio issue #72.

## Motivation

Loose prompt strings cannot reliably identify their owner, intended behavior,
inputs, output contract, compatibility, or governing evidence. Provider-native
request objects add unstable vendor roles, options, identifiers, and defaults.
Free-form interpolation can conceal environment reads, undeclared variables,
or ambiguous escaping. Any of these would make validation and provenance
dependent on one Platform implementation.

ADR 0016 assigns stable prompt semantics to Codex, experiments to Lab, and
production rendering/execution to Platform. This RFC supplies the first stable
contract at that boundary while leaving renderer behavior, adapter APIs,
registry implementation, context-package integration, and execution provenance
to their dedicated issues.

## Specification

The normative contract is
[`prompt-definition-v1.md`](../specs/prompt-contracts/prompt-definition-v1.md).
Its machine-readable syntax is
[`prompt-definition.schema.json`](../schemas/json/prompt-contracts/v1/prompt-definition.schema.json).

The format uses a closed JSON object and rejects unknown fields. A definition
has a stable dotted ID, independent semantic version, owner/purpose/lifecycle,
declared inputs, declared context slots, ordered provider-neutral messages,
required and optional capabilities, an output declaration, provenance/rights,
governance evidence, and optional namespaced extensions.

Message content is a sequence of typed parts:

- `text` is immutable literal text;
- `input` references one declared input and selects text or canonical-JSON
  formatting; and
- `context` references one declared context slot and selects text or
  canonical-JSON formatting.

Typed references make the data dependency visible to schema-independent tools
and eliminate a need for environment, filesystem, network, or arbitrary-code
template evaluation. The renderer will define escaping, canonical JSON, and
cross-reference diagnostics under issue #63.

Capabilities use provider-neutral names. Provider-specific behavior may appear
only inside a namespaced extension envelope that records whether it is required
and its fallback policy. The execution contract under issue #65 decides whether
an adapter supports that extension; the prompt format never embeds credentials
or provider transport.

## Compatibility and migration

Prompt Specification and individual prompt-definition versions are independent.
Both use Semantic Versioning, but changing the schema does not automatically
change every prompt, and changing a prompt does not change the schema.

The exact rules are normative in
[`VERSIONING.md`](../specs/prompt-contracts/VERSIONING.md). In summary, any
changed released bytes receive a new prompt version; a required input,
incompatible output, changed purpose, newly required context/capability/
extension, or semantic removal is Major; compatible optional behavior is Minor;
and metadata-only corrections that cannot affect rendering or execution are
Patch. Unknown v1 fields are rejected. Breaking Prompt Specification changes
require a new major schema, side-by-side fixtures, migration guidance, consumer
inventory, and compatibility window.

There is no migration because this is the first version. Pre-contract prompt
files remain experimental and must be reviewed and restated rather than
relabelled automatically.

## Security and privacy

The schema contains no credential field and the normative contract prohibits
secrets, implicit external reads, private runtime context, and raw sensitive
evidence. Inputs and context slots declare classifications. A definition cannot
authorize access; the caller and Platform enforce policy outside model output.

Closed objects reject undeclared behavior. Context content is supplied only at
runtime through the Context Builder boundary and is not embedded in the
definition. Governance and provenance URLs must be reader-safe; restricted
evidence is represented by an approved non-derivable attestation.

Schema conformance proves document shape only. Semantic validators must also
detect duplicate symbols, unresolved references, type-incompatible constraints,
unsafe authoring patterns, capability/output contradictions, and forbidden data
under issue #64.

## Rights, provenance, accessibility, and portability

Every definition records its origin, creator/maintainer identity, rights basis,
notices, review, and source references where applicable. Third-party or derived
prompt text needs exact reader-safe provenance and compatible permission.

The definition may declare accessibility-relevant output requirements in its
purpose and output description, but automation cannot approve audience impact
or accessibility quality. JSON plus the published schema and fixtures is the
portable baseline; an independent implementation can validate and render it
without a provider SDK or hosted prompt service.

Provider extensions cannot change core field meaning. Unknown required
extensions fail, optional extensions use their declared portable fallback or
fail according to the definition, and exact use remains execution provenance.

## Alternatives considered

### Free-form template strings with embedded placeholders

Rejected for v1 because placeholder parsing, escaping, nested paths, helpers,
and implicit values easily become implementation-specific. Typed parts expose
every input and context reference structurally. A later compatible contract may
add a tightly specified text-template part if evidence justifies it.

### Provider-native messages and request objects

Rejected because vendor roles, parameters, tools, response modes, and defaults
would become durable Studio semantics and make another adapter unable to
interpret the definition independently.

### One schema for definitions, executions, and results

Rejected because a durable definition, a rendered execution input, and a
provider outcome have different sensitivity, lifecycle, compatibility, and
ownership. Issues #65 and #69 own execution/result/provenance contracts.

### Allow arbitrary metadata or unknown fields

Rejected in v1 because a permissive object would let behavior hide outside the
contract. Explicit namespaced extensions provide a reviewable evolution path.

### Embed Context Builder packages in prompt definitions

Rejected because definitions must remain content-neutral and reusable. They
declare slots; a caller supplies an approved explicit package at runtime.

## Implementation plan

On merge, Codex owns the candidate specification, schema, versioning rules, and
fixtures. Platform issues #63 and #64 implement renderer and validator behavior
against the exact candidate revision. Issues #65 through #69 add separate
execution, registry, context, output, and provenance contracts without editing
v1 meaning locally.

Before production use, issue #72 packages the normative specification, schema,
fixtures, license, notices, and digest manifest; verifies conformance; publishes
an immutable `contract/prompt-definition/v1.0.0` release; and records the full
stable reference tuple in each consumer.

## Unresolved questions

- The exact renderer API, canonical JSON algorithm, and cross-reference
  diagnostic codes belong to #63 and #64.
- Execution capability vocabulary beyond the v1 `text-generation` and
  `structured-output` names belongs to #65.
- Registry packaging and discovery protocol belongs to #66.
- Context-package stable reference fields and size negotiation belong to #67
  and Epic #5.
- Structured-output parsing/repair policy belongs to #68.
- Execution provenance retention and observer interfaces belong to #69.

None of these questions may change the ownership boundary, introduce implicit
data access, make a provider authoritative, or weaken the closed portable v1
document without a compatible Codex change or new major version.
