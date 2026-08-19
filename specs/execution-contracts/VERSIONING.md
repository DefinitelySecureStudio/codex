# Provider Execution Contract versioning

Provider Execution Contract versions follow the repository-wide
[versioning policy](../../docs/versioning.md). The descriptor, request, result,
capability vocabulary, portable parameter semantics, extension envelope, and
error taxonomy form one compatibility unit released as `provider-execution`.

## Independent versions

The following axes are independent and MUST all remain visible:

- Provider Execution Contract version (`spec_version`);
- Prompt Definition Specification and prompt-definition versions;
- renderer/Platform SDK version;
- adapter version;
- provider/model/revision identity; and
- extension-specific contract versions encoded by their exact namespace or
  referenced evidence.

Changing one axis MUST NOT be presented as a change to another.

## Compatibility classification

A change is **Major** when an existing conforming producer or consumer must
change, including removing/renaming a field, narrowing an accepted value,
changing portable parameter/capability/error meaning, altering retry defaults,
changing digest coverage, or weakening/strengthening a required failure.

A change is **Minor** when it adds optional negotiated behavior that old
consumers can reject or safely omit, such as a new document kind, optional
field, namespaced capability, or extension seam with an unchanged v1 baseline.

A change is **Patch** only for editorial clarification or schema correction
that makes machine validation match already-unambiguous normative text without
changing accepted behavior.

Adapter versions follow SemVer independently. A translation, normalization,
error-mapping, capability, default, retry classification, identity, or
sensitivity-handling change requires an appropriate adapter version bump even
when `spec_version` remains unchanged.

## Negotiation and rollout

Consumers select an exact contract version and reject unknown major versions.
They MUST NOT infer support from a version range alone: capability and extension
negotiation uses the exact descriptor returned for the configured target.

Breaking rollout requires side-by-side schemas/fixtures, affected adapter and
caller inventory, migration mapping, compatibility window, rollback plan, and
review of in-flight idempotency/provenance evidence. Old results remain
interpretable under their recorded version; they are never rewritten.

Before production use, issue #72 publishes the complete immutable contract
bundle, verifies its size/digest manifest, and updates every consumer from the
provisional accepted commit to the released artifact tuple.
