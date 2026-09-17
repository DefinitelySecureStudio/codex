# RFC 0007: Comic Manifest v1 contracts

Status: Proposed; acceptance requires owner merge and coordinated Platform review.
Owner: @andrewperis. Issue: https://github.com/DefinitelySecureStudio/studio/issues/89
Constitution: v1.0.0, `constitution/v1.0.0`, commit
`a9cc8a503aa30e17820edc62ac95f7cbe10e0564`.

## Decision and context

Adopt the [Comic Manifest v1 specification](../specs/manifests/comic-manifest-v1.md)
and closed schema as a new additive, unreleased 1.0.0 contract family implementing
merged Studio ADR 0018. Production intent, observed build results and reader-safe
release candidates have separate immutable payloads and visibility. Detached
approval bindings avoid circular hashes and preserve exact scope without granting
authority from schema validity. Public private-context lineage uses approved random
attestations and protected mappings, not protected record IDs or hashes.

Codex owns normative meaning. Platform validates and supplies a test-only consumer
proof against the existing released SDK/Builder output. Universe owns public
publication and canon; private source owners retain access/disclosure authority.
No released contract bytes change. Exact-version negotiation and unknown-field
rejection are deliberate exceptions to permissive minor-version consumption.

## Alternatives and consequences

One mutable record mixes intent, execution and publication and risks leaking private
lineage. A status flag or embedded signature in its own hashed payload conflates
identity with authority or creates circular identity. Permissive extension fields
make executable intent and protected-data projection harder to audit. Runtime-owned
schemas would split authority. These alternatives are rejected.

Separate records require explicit linkage verification and detached decisions.
The first version limits rendition formats, publishes a selected result's entire
output set and leaves event/storage protocols and production trust to separately
reviewed work. Reviewers must inspect prose and output bytes; allowlists and hash
checks cannot establish disclosure safety or human authority.

## Compatibility, verification and rollout

See [versioning](../specs/manifests/COMIC-MANIFEST-VERSIONING.md) and
[synthetic fixtures](../fixtures/comic-manifest-v1.md). Positive/negative schema and
cross-record cases accompany the proposal; raw parser hardening, source readers,
trust/revocation, actual media inspection and orchestration are not implemented.
Platform consumes exact candidate fixture bytes with a test-only commit/digest lock;
merge Codex before the coordinated Platform consumer. Production adoption waits for
#99's immutable release, complete verified tuples and owner-reviewed conformance.
No migration of released SDK/Context Package/Builder is required. Rollback removes
the development consumer; it does not rewrite released artifacts or renew permission.

## Scoped constitutional assessment

Subject: this #89 candidate diff against Codex
`2301597014f6fefe8a3cf772e2e02527cda6a254`; exact revision is the adopting PR head.
Prepared 2026-09-17; accountable owner @andrewperis; required reviewers: Codex owner,
Platform maintainer, and editorial/source owners for affected release boundaries.
Status: **Not assessed** for final constitutional conformance; no self-approval.
Universal, specification and repository/production-system design profiles apply;
automated-workflow obligations inform the consumer seam. The specification's
ownership, gates, identity, provenance/privacy, rights, failure and compatibility
sections supply proposed design evidence. Qualified review against the Studio
checklist at `7b5065cef76bea9580609caba356b0d8fe7cc17c` remains required. Runtime,
creative and publication activities are excluded, so no production/canon/release
conformance is claimed. No amendment or exception is requested. Reassess on identity,
authority, classification, contract, storage or consumer-boundary changes and before
immutable publication. CODEOWNERS review records the actual acceptance decision.
