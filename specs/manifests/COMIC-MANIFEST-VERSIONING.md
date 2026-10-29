# Comic Manifest compatibility and release boundaries

## Published 1.0.0 baseline

Comic Manifest 1.0.0 is a published contract bundle. The Codex release
[`contract/comic-manifest/v1.0.0`](https://github.com/DefinitelySecureStudio/codex/releases/tag/contract/comic-manifest/v1.0.0)
is published and marked immutable at source commit
[`12e437e30328a3bb9cd2d15e6307a70b4b7e0e2a`](https://github.com/DefinitelySecureStudio/codex/commit/12e437e30328a3bb9cd2d15e6307a70b4b7e0e2a).
It contains the closed schema, normative specification and fixture bundle for
production, build-result, public-release and detached-approval records. Platform
binds its v1.0.0 implementation to the same Codex tag, commit and schema asset.

The Platform consumer release
[`comic-manifest/v1.0.0`](https://github.com/DefinitelySecureStudio/platform/releases/tag/comic-manifest/v1.0.0)
is also published and marked immutable. Its source is commit
[`f0672d90a47473da6a27614cad07abc175546d67`](https://github.com/DefinitelySecureStudio/platform/commit/f0672d90a47473da6a27614cad07abc175546d67).
The [publication proof](https://github.com/DefinitelySecureStudio/platform/blob/f66b755b797aa5d5b4dee5f7da9f6995c3e98f75/release/comic-manifest-v1.0.0-publication-proof.json)
records fresh-download verification for its eight public release assets. The
Platform contract binding identifies the Codex schema asset as 30,860 bytes with
SHA-256 `7bd3c5392ae0db0c5baba553c233142d3d4427471f5850123eef7b87d4c8eaa4`.

The 1.0.0 schema file, normative specification, bundle, and both releases are
historical immutable artifacts. The schema's `title` and the versioned
specification's header retain proposal-era “candidate” and “unreleased” wording
from their published source; those strings are preserved release content, not
the current publication status. RFC 0007 and RFC 0008 likewise retain their
proposal-stage wording as historical RFC records. This versioning document
records the later publication fact without changing those artifacts' lifecycle
history or implying further authority.

Studio issue [#99](https://github.com/DefinitelySecureStudio/studio/issues/99)
closed complete after publication and consumer-handoff verification. That
closeout records the exact artifacts; it does not itself authorize real-provider
execution, production trust onboarding, private-source use, orchestration, canon
promotion or creative publication. The Platform package remains private and was
not published to npm.

## Version and compatibility policy

Consumers advertise exact supported kind/version pairs. A 1.0.0 validator
rejects 1.0.1 or 1.1.0 until that exact version is explicitly supported. Closed
records cannot silently ignore new fields. New fields or changes to accepted
meaning require coordinated review, a versioned schema ID and support
negotiation; incompatible representations require a new major version under
Codex policy.

The published 1.0.0 tag, schema asset, bundle, and Platform release must never be
replaced or moved. A correction or expanded capability requires a separate
reviewed version and immutable release; it must preserve exact-version
negotiation. Existing records are not rewritten or silently upgraded.

The additive rendition/profile proposal in RFC 0008 was part of the source that
was ultimately published as Comic Manifest 1.0.0. References in RFC 0007 and
RFC 0008 to an unreleased candidate describe their proposal-time context; this
living document and the publication records above give the current artifact
status.

## Consumer and production boundaries

Platform is the released v1.0.0 consumer. Universe public release records and
approved private production/provenance stores remain subject to their own owner
review and exact-version support. The schema and release package prove bytes and
version identity; they do not establish rights, authority, safety, publication
approval or production trust.

Any future contract version must identify affected consumers, document
compatibility and migration requirements, provide side-by-side fixtures, and
include a reviewed rollback and support-window plan before deprecation. A new
contract release does not start a support window or retire older immutable
releases by itself. Rollback selects an explicitly supported immutable version
and cannot restore revoked authority.
