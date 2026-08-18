# Prompt definition versioning and compatibility

This policy is normative for Prompt Definition Specification v1.0.0. The
repository-wide [versioning policy](../../docs/versioning.md) also applies.

## Independent version axes

A prompt artifact records at least two versions:

- `spec_version` selects the Prompt Definition Specification and schema used to
  interpret the document; and
- `version` identifies the behavior and contract of that individual prompt ID.

Platform SDK, renderer, context-package, output-schema, adapter, provider/model,
and execution-contract versions are separate. A consumer must not infer one
from another.

## Immutability

Released prompt-definition bytes are immutable. Any byte change produces a new
prompt version, even when SemVer classifies the change as compatible. Registries
must reject two different byte sequences claiming the same prompt ID and
version.

Production and release workflows resolve an exact prompt ID, version, artifact,
size, and digest. `latest`, a range, a branch, or an unverified registry object
may be used only to discover an upgrade candidate, never as final provenance.

## Prompt version changes

Increment **MAJOR** for an incompatible contract or intended-behavior change,
including:

- changing prompt purpose so an existing caller's use is no longer valid;
- removing or renaming an input/context slot, adding a required one, changing
  its type, or tightening a constraint that rejects a previously valid value;
- changing message/part ordering or instructions in a way that invalidates an
  existing output expectation or human approval;
- changing output kind or to an incompatible output schema;
- adding a required capability or required provider extension without the same
  portable behavior for existing consumers;
- weakening classification, provenance, rights, governance, validation, or
  failure requirements; or
- retiring behavior without the approved compatibility window.

Increment **MINOR** for a backward-compatible intended-behavior change,
including:

- adding an optional input or context slot with no effect when omitted;
- adding an optional capability or extension with a documented portable
  fallback;
- changing literal instructions while preserving purpose, accepted inputs,
  output contract, safety boundary, and existing consumer expectations;
- broadening a constraint without weakening security, privacy, rights, or
  required quality; or
- announcing deprecation with a replacement and support window.

Increment **PATCH** only when the change cannot alter rendering or execution,
such as correcting a description, tag, source reference, notice, or other
non-behavioral metadata. Reordering messages/parts, changing literal text,
defaults, constraints, capabilities, output declarations, or extensions is not
a Patch.

When impact is uncertain, use the larger increment and obtain consumer review.
SemVer compatibility never substitutes for exact artifact pinning.

## Lifecycle and deprecation

Lifecycle states are:

- `draft`: incomplete and not an accepted dependency;
- `experimental`: evaluated with safe data and not a stable dependency;
- `stable`: accepted and released for declared consumers;
- `deprecated`: still available during a dated window with a replacement or
  explicit no-replacement rationale; and
- `retired`: unavailable for new execution and retained only for history,
  audit, or reproducibility under its retention policy.

A definition cannot claim `stable` before its immutable contract bundle and
prompt artifact are published. Deprecation requires `deprecated_at`, `reason`,
`support_until`, and either `replacement` or a no-replacement explanation.
Retirement cannot silently resolve an existing exact pin to another version.

## Prompt Specification changes

The Prompt Definition Specification itself uses Semantic Versioning:

- Major changes remove or redefine fields, change closed-object behavior,
  invalidate previously conforming definitions, or alter normative rendering/
  execution meaning.
- Minor changes add optional fields or compatible vocabulary with explicit old-
  consumer behavior.
- Patch changes clarify text or correct schema/spec disagreement without
  changing accepted documents or meaning.

V1 consumers reject unknown fields. Therefore a future Minor schema addition
must define capability negotiation or a new schema selection path; producers
must not emit the field to a consumer that supports only an earlier Minor.

A breaking specification change requires an accepted RFC, new major schema ID,
side-by-side schemas and fixtures, migration guide, affected-consumer inventory,
dated compatibility window, rollback evidence, and immutable releases for both
the final old and first new versions.

## Pre-release and migration rules

Pre-release identifiers may be used for review and conformance testing, but a
pre-release cannot claim stable lifecycle status. Build metadata does not alter
precedence and must not distinguish different prompt behavior.

Experimental Lab prompts are promotion lineage, not earlier Codex versions.
Promotion restates the prompt under this contract, assigns a Codex-governed ID
and version, removes private/story-specific content, and links the Lab source
without importing it as a runtime dependency.

Migrations preserve prompt ID mappings, intended purpose, input/output meaning,
classifications, rights, provenance, approvals, exact old/new artifacts, and
rollback. Any known loss or provider-only behavior is explicit and approved.
