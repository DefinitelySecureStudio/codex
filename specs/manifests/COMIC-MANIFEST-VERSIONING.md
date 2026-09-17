# Comic Manifest compatibility and release boundaries

Comic Manifest 1.0.0 is a new additive **unreleased candidate family**. The three
record kinds and detached approval definition travel together in one contract
bundle. Their `spec_version` is independent of episode revisions, artifact logical
versions and the Context Package/Builder/Prompt SDK contract versions.

Consumers must advertise exact supported kind/version pairs; a 1.0.0 validator
rejects 1.0.1/1.1.0 until explicitly supported. This is the RFC's intentional narrow
capability rule, not a promise of implicit minor compatibility. Closed records
cannot silently ignore new optional fields. New fields or changes to accepted
meaning need coordinated review, a versioned schema ID and support negotiation;
incompatible representations require a new major version under Codex policy.

No released foundation changes or migrations are needed. Preserve the bytes of
Prompt Definition, Provider Execution, Context Package, Structured Output,
Execution Provenance and Context Builder, including their released artifacts.
This work changes neither release catalogs nor existing release tags. Draft source
pins used in tests are explicitly non-production and never replace a release lock.

Before production use (#99): owner-accept RFC/spec/fixtures; complete Platform
conformance and affected-consumer reviews; add a separate release catalog; package
schema/spec/fixtures/license/notices; verify immutable release assets and record
repository, version, tag, commit, URI, media type, byte size and SHA-256 in every
consumer. Expected tag: `contract/comic-manifest/v1.0.0`. No tag, registry publication
or production trust deployment is authorized by #89 or its merge.

Known consumers: Platform #90–#98 and future Epic #7; Universe's owner-reviewed
public release records; approved private production/provenance stores. Studio
coordinates architecture, never supplies a runtime dependency. Record Codex owner
and Platform feasibility/consumer review before adoption. Universe/source owners
review publication and protected-evidence boundaries before real use.

A future migration must preserve production/panel/episode identity, immutable
history, classification, rights and exact evidence links; changed bytes get new
candidate identities and applicable reviews. It must inventory consumers, document
loss explicitly, provide side-by-side contracts/fixtures and a dated support window
approved by owners before deprecation. No retirement or support window is started
by this initial candidate. Old releases remain available; rollback selects an
explicit supported immutable version and cannot restore revoked authority. No
silent downgrade, lossy conversion or private-data disclosure is permitted.
