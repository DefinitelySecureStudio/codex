# Versioning and compatibility policy

## Contract versions

Each independently consumable contract uses semantic versioning in the form
`MAJOR.MINOR.PATCH`:

- increment **MAJOR** for an incompatible change;
- increment **MINOR** for backward-compatible additions or deprecations; and
- increment **PATCH** for compatible corrections or clarifications.

Versions below `1.0.0` are proposed or pre-stable. Consumers must not treat a
`0.y.z` contract as production-stable unless an RFC explicitly defines that
exception.

## Compatibility

A consumer that supports `MAJOR.MINOR` must accept inputs produced against the
same major version at an equal or lower minor version unless the specification
defines a narrower capability-negotiation rule. Producers must not emit newly
added optional behavior to a consumer that has not declared support for it.

Unknown fields are handled exactly as each contract specifies; consumers must
not assume a global ignore-or-reject rule. Security-sensitive contracts should
default to rejecting unknown behavior unless their RFC documents a safe
extension mechanism.

## Breaking changes

A breaking change requires:

1. an accepted RFC and a new major contract version;
2. side-by-side schemas and fixtures for the old and new major versions;
3. a migration guide and affected-consumer inventory;
4. a dated compatibility window during which the prior major remains available;
   and
5. release provenance that identifies the exact contract version used.

## Repository releases

Each independently consumable contract is released as a self-contained bundle
containing its normative specification, schemas, conformance fixtures, license,
notices, and a manifest of included files and SHA-256 digests.

Use an immutable GitHub Release tag in the form
`contract/<contract-name>/vMAJOR.MINOR.PATCH`. Prepare all assets on a draft and
publish once after validation. The release identifies the exact Codex commit.

A production consumer records the complete stable reference tuple:

- repository and contract name;
- semantic version and immutable release tag;
- exact source commit;
- artifact URI, media type, and byte size; and
- `sha256:` artifact digest.

The version and tag communicate compatibility; the digest identifies the bytes;
the commit preserves source traceability. Moving branches, floating version
ranges, tags without digest verification, and copied local schemas are not
production references.

The organization-wide mechanism and upgrade rules are defined by the
[Studio dependency strategy](https://github.com/DefinitelySecureStudio/studio/blob/main/dependency-strategy/README.md).

## Canonical schema identifiers

JSON Schemas use an absolute, version-specific `$id` in this form:

```text
urn:definitely-secure:contract:<contract-name>:<MAJOR.MINOR.PATCH>:<schema-name>
```

Contract and schema names use lowercase ASCII kebab-case. The identifier names
the logical schema; the released contract manifest supplies its retrievable
artifact URI, exact commit, size, and digest. A new schema version receives a
new `$id`; do not serve changed bytes under an existing identifier.
