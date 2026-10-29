# Comic Manifest 1.0.0 released schema

This schema is published in the immutable Codex
[`contract/comic-manifest/v1.0.0` release](https://github.com/DefinitelySecureStudio/codex/releases/tag/contract/comic-manifest/v1.0.0),
source commit [`12e437e30328a3bb9cd2d15e6307a70b4b7e0e2a`](https://github.com/DefinitelySecureStudio/codex/commit/12e437e30328a3bb9cd2d15e6307a70b4b7e0e2a).
Its original JSON Schema `title` retains proposal-era “candidate” wording as
part of the released bytes; do not edit or republish those 1.0.0 bytes.

[Schema](comic-manifest.schema.json): closed Draft 2020-12, standalone, no network
references. Root accepts production, build-result and public release payloads.
Use its `$defs/approval` entry point for detached approval bindings.

[Normative semantics](../../../../specs/manifests/comic-manifest-v1.md),
[versioning](../../../../specs/manifests/COMIC-MANIFEST-VERSIONING.md) and
[fixture guide](../../../../fixtures/comic-manifest-v1.md) are required companions.
The exact versioned rendition profiles and their media, dimensions and byte/pixel
limits are defined in the normative specification and enforced relationally by
consumer conformance checks.
Schema validation is only the structural layer; it proves neither cross-record
integrity nor authority. Studio issue [#99](https://github.com/DefinitelySecureStudio/studio/issues/99)
records the completed Codex/Platform publication and consumer handoff. Further
production use, real-provider execution, and publication authority remain separate
owner decisions.
