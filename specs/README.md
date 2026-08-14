# Specifications

This directory contains human-readable normative contracts. Each contract lives
in exactly one family and identifies its status, semantic version, owning RFC,
maintainers, schema paths, and compatibility notes.

Initial contract families:

- [`ids/`](ids/) — identifiers and naming rules;
- [`manifests/`](manifests/) — production and release manifests;
- [`context-packages/`](context-packages/) — portable context boundaries;
- [`prompt-contracts/`](prompt-contracts/) — prompt inputs, outputs, and
  invariants;
- [`assets/`](assets/) — filenames, renditions, metadata, and provenance; and
- [`taxonomies/`](taxonomies/) — controlled vocabularies and classifications.

Copy [`_template.md`](_template.md) for a new specification. A specification is
not stable until its RFC is accepted, schemas and fixtures agree, and a version
is recorded in the changelog.
