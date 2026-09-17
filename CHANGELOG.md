# Changelog

## Unreleased — Context Builder publication preparation (#86)

- Add an explicit independent release catalog, deterministic artifact tests and
  owner-gated publication/adoption checklist. Normative schemas and fixtures are unchanged.

All notable contract changes will be documented here. Each entry must identify
the affected contract and version and classify the change as breaking,
compatible, or editorial.

## Unreleased

- Added Context Builder 1.0.0 (new additive, unreleased contract family) for
  Studio #76: RFC 0006, closed producer schemas, deterministic selection/assembly
  semantics, protected lineage/public receipts and synthetic conformance cases.
  No released Prompt SDK contract bytes change; no migration is required.

- Prepared five Prompt SDK v1 contract bundles and release checklist for #72.
- Corrected the unreleased Context Package v1 schema id to the standard URN;
  payload validation semantics are unchanged and Platform pins must refresh.

- Hardened the unreleased Execution Provenance candidate after PR #9 review:
  enforce identity policy, portable domains, status/finish relationships,
  structured processing identity and timestamp formats; add 64 conformance cases.

- Added Execution Provenance v1.0.0 (new candidate contract): metadata-only
  records, canonical identity, classification-aware redaction, observer failure
  isolation, RFC 0005, and synthetic conformance fixtures for issue #69.

- Added the Structured Output v1.0.0 candidate (new contract): RFC 0004,
  validated result/failure schema, raw/normalized identity, exact schema
  verification, retention and provider-constraint provenance, explicit failure
  behavior, and synthetic fixtures.
- Added the Context Package v1.0.0 candidate (new contract): RFC 0003, inline
  package/reference/authorization schema, exact content and source identity,
  classification/time/slot-binding rules, rendered execution provenance, and
  synthetic conformance fixtures.
- Added the Provider Execution Contract v1.0.0 candidate (new contract): RFC
  0002, adapter/request/result schema, capability and portable parameter model,
  extension behavior, normalized error taxonomy, versioning, conformance record,
  and synthetic valid/invalid fixtures.
- Added the Prompt Definition Specification v1.0.0 candidate, JSON Schema,
  versioning rules, RFC 0001, and synthetic valid/invalid conformance fixtures.
- Adopted Constitution v1.0.0 with a revision-scoped conformance assessment and
  constitutional reference fields for RFC and specification templates.
- Created the initial RFC, specification, schema, fixture, and governance
  structure.
