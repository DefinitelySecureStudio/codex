# Comic Manifest 1.0.0 candidate schema

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
integrity nor authority. Unreleased candidate; production consumption waits for #99.
