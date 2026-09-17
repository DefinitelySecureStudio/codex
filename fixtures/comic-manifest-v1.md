# Comic Manifest synthetic conformance fixtures

[Base scenario](comic-manifest-v1.json) contains production, result, release and
detached approval payloads, plus **non-normative** test harness byte maps, restricted
linkage, trust and explicit evaluation time. It references the unchanged
[Context Builder fixture](context-builder-v1.json). Every character, authority,
source, attestation, URL, commit and publication number is synthetic; no network
access or real canon/private material is required or permitted. Fixed UUIDs model
shape only. Fake public dependency tuples are not release assets.

[Negative overlays](comic-manifest-v1-cases.json) are machine-readable fixtures:
clone the base, apply each `edits` path in order, then check the declared `layer`.
Schema cases fail before relationships. Relational cases MUST remain schema-valid
and fail with the declared invariant code. `rebind: true` requests fresh synthetic
hashes and explicit fake decisions to isolate the semantic error; it never means
real edits preserve or renew approvals. `rebind: false` retains historical evidence
to test invalidation. See the [test-only oracle](../tests/support/comic-manifest-oracle.cjs).

The suite includes protected-context and authored public-only success, append-only
correction, partial/failed evidence, deterministic identity, unknown versions/fields,
ordered identities, outputs, immutable references, package bindings, stale/revoked/
forged approvals, public gates and private-context projection. Output text bytes and
public dependency bytes are explicit fixture inputs and independently hashed.
Tests never create an approval from a production runtime or execute a provider.

Run `npm ci --ignore-scripts`, then `npm run test:comic`. Run `npm test` from a clean
committed tree to include existing release-bundle reproducibility tests (the release
builder intentionally refuses dirty trees). Node >=22; dependencies are pinned in
the lockfile. Neither command needs network after dependency installation.

Coverage limits are explicit: the oracle exercises fixture relationships, not a
hardened parser, production trust verifier, media decoder, issuer, secure store or
public projection implementation. Current package use is tested by the companion
Platform proof using the released SDK. Unicode/duplicate-key/size/depth raw parsing,
real revocation adapters, denied-read guarantees, free-text disclosure and artifact
rights need their later runtime and qualified human checks. Passing fixtures alone
never establishes permission, safe publication or creative canon.
