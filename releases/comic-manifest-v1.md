# Comic Manifest v1 publication checklist — Studio #99

Owner: @andrewperis. This is release preparation only. It creates no tag,
release, asset, npm publication, visibility change, security-policy change, or
production permission. The candidate catalog contains only the additive
`comic-manifest` contract; the Prompt SDK five-contract and Context Builder
single-contract catalogs remain separate and their historical releases stay
unchanged.

## Candidate and review boundary

- Contract: `comic-manifest` 1.0.0, exact tag
  `contract/comic-manifest/v1.0.0`, schema ID
  `urn:definitely-secure:contract:comic-manifest:1.0.0:comic-manifest`.
- The contract combines production manifest, build-result, public-release, and
  detached approval definitions in the one reviewed closed schema. It does not
  authorize execution, publication, access, or Canon promotion.
- Normative sources are RFC 0007, RFC 0008, the Comic Manifest v1 specification,
  versioning policy, schema README, and synthetic fixtures. The owner-approved
  golden/catalog/oracle packet recorded by Platform #41 is evidence only for
  those exact proposed files at source head
  `97dcd990e87bd0368ddcbecf66d1a6718bc7629e` (chat acceptance
  `2026-10-07T19:15:38Z`). It was not a GitHub review and is not release approval.
  No approved golden, oracle, source, or scenario bytes are modified here.
- Constitution v1.0.0 is pinned to `constitution/v1.0.0`, Studio commit
  `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`. The owner's task-specific Epic
  #6 A3 AI-review exception applies to code-merge review only. It does not
  authorize an A4 release decision, tag, release asset, or publication; no
  release/publication exception is provided. No human review of final release
  artifacts is claimed here, and separate explicit owner release approval
  remains required.
- Existing dependency versions and lock bytes are unchanged. Review the exact
  lockfile audit report and the Apache-2.0 LICENSE, NOTICE, and any
  THIRD_PARTY_NOTICES included in the bundle before approving release.
- A fresh `npm audit --json` against this Codex preparation branch's lockfile
  reports zero advisories; rerun it against the exact merged head before
  publication.

## Build and verify locally

1. Merge the reviewed Codex preparation change only after the contract owner
   approves its exact head. Then use the clean merged Codex commit as the
   release source; a branch, PR head, or local preparation build is not the
   final release identity.
2. Run the full Codex test suite and the fresh locked-dependency and
   license/NOTICE review. Resolve Blocker/Major findings before release.
3. On a clean checkout, build twice into two new external directories:

   ```sh
   node scripts/build-contract-release.mjs /absolute/new/codex-comic-1 comic-manifest-v1
   node scripts/build-contract-release.mjs /absolute/new/codex-comic-2 comic-manifest-v1
   ```

   For a local repository snapshot whose verified remote source commit has a
   different commit object but the exact same tree, both commands may append
   `--source-commit VERIFIED_COMMIT --source-tree VERIFIED_TREE`. First make
   the source commit object available locally (for example, fetch that exact
   public commit without tags) and confirm the GitHub commit API's tree. The
   builder independently resolves the supplied commit object's tree, requires
   it to match both the supplied tree and the clean local `HEAD` tree, then
  reads all bundled files from the verified source commit. Every builder Git invocation
  sets `GIT_NO_REPLACE_OBJECTS=1` for object checks and source reads, without
  changing global Git configuration. Regression tests create isolated replace
  refs and prove they cannot change either accepted or rejected commit/tree
  relationships. A commit-shaped caller string without a verified local
  commit object fails closed. A normal merged checkout uses `HEAD` and needs
  no override.

4. Compare every filename and byte across both directories. Each directory has
   exactly these three expected outputs:
   `comic-manifest-v1.0.0.schema.json`,
   `comic-manifest-v1.0.0.bundle.json`, and
   `comic-manifest-v1.0.0.manifest.json`. The manifest binds the exact source
   commit, schema ID, tag, schema/bundle URIs, declared media types, sizes and
   SHA-256 values. Its schema and bundle `assets` entries are the two payload
   assets; the manifest file is attached as the third release asset and has its
   own independently recorded digest in the approval packet. This avoids a
   self-referential manifest digest.
5. Inspect the schema and bundle bytes, check every decoded bundle member's
   relative path, byte count and digest, and confirm LICENSE and NOTICE are
   included. The bundle carries the reviewed repository source for provenance;
   only the single Comic Manifest contract is an asset/tag in this catalog.
6. Confirm the exact release/tag target, asset names and immutable-release
   setting. `application/schema+json` and `application/json` describe the
   expected downloaded file contents. GitHub upload/download response MIME
   headers are transport metadata and may be `application/octet-stream`; record
   both values separately and never rewrite the declared contract media type to
   match the transport header.

## Owner-approved publication sequence

This checklist is not itself permission to publish. After review/merge, request
an explicit owner decision naming the exact merged Codex commit and all three
asset sizes/digests. Only then may the owner create a draft release at
`contract/comic-manifest/v1.0.0`, attach the schema, bundle, and manifest, and
review the notes. Download all three draft assets independently and compare
every byte with both clean builds. Publish once only after this review and
download check. Then independently verify that the release is published and
immutable, the exact tag resolves to the approved commit, and fresh downloads
still match all identities. Never move the tag or replace an asset; a correction
requires a new reviewed version.

## Consumer handoff and compatibility

After Codex publication, Platform separately downloads the exact assets, checks
the tag/commit, sizes and digests, regenerates its validator from the downloaded
schema, reviews the consumer lock, and passes its supported CI. Platform's
component tag proposal is `comic-manifest/v1.0.0`; its additive package release
candidate is 1.2.0. Neither candidate is final until that adoption and its own
owner release decision are complete. Prompt SDK v1, Context Package v1, and
Context Builder v1 immutable artifacts are not republished.

Compatibility remains exact kind/version negotiation. A compatible correction
requires a reviewed patch release; additive contract capabilities require an
explicitly supported version; breaking meaning requires an accepted RFC, new
major, affected-consumer inventory, side-by-side fixtures, migration and
rollback plan, deprecation release, and dated support window. No retirement or
support window starts in this initial release preparation.

Issue #101 / Build Orchestrator receives verified Codex and Platform artifact
tuples, conformance and verification evidence, API/CLI and adapter boundaries,
limits, known limitations, and unresolved production-trust/owner gates. This
handoff does not add scheduling, retries, providers, rendering, production
trust, access renewal, canon, or publishing automation. Close #99 and Epic #6
only after the actual approved publications and fresh-download verifications.
