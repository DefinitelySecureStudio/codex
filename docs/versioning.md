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

Repository tags, artifact packaging, immutable pinning, and the relationship
between repository releases and independently versioned contracts will be
finalized by
[studio issue #33](https://github.com/DefinitelySecureStudio/studio/issues/33).
Until then, consumers must pin an immutable Git commit and record the individual
contract version. Moving branches such as `main` are not reproducible release
references.
