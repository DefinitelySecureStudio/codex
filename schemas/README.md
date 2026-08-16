# Schemas

Machine-readable schemas implement the normative constraints defined in
`specs/`. JSON Schema documents belong in [`json/`](json/); YAML-based schema or
validation definitions belong in [`yaml/`](yaml/).

Each schema must identify its contract family and semantic version, have a stable
canonical identifier once the namespace is selected, and link to valid and
invalid fixtures. A schema must not introduce behavior absent from the
human-readable specification.

Use the canonical, version-specific schema-ID namespace and immutable artifact
distribution mechanism defined in
[`docs/versioning.md`](../docs/versioning.md#canonical-schema-identifiers).
