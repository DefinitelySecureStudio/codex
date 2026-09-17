# Context Builder v1 publication checklist — Studio #86

Owner: @andrewperis. Release preparation only; no tag or asset has been published
by this change. Merge approval is required before building the publication candidate.

This additive family publishes the exact schema already reviewed in #76:
SHA-256 `4adebedcef5a26e009e1d53ec9c480d372a31b73211fec1c53d6509ebc7929a3`.
The schema's historical candidate title is descriptive, not a lifecycle signal.
No schema, normative behavior, fixture, or Context Package v1 byte changes here.
The immutable release and verified identity tuple establish publication status.

1. Verify #75–#85 are merged/owner-reviewed and Platform Node 22/24 CI passes.
   Review Constitution v1.0.0, Apache-2.0 LICENSE/NOTICE, synthetic-only fixtures,
   dependency audit and known limitations. No production authority is conferred.
2. On clean merged Codex main run all tests (see repository test commands) and:
   `node scripts/build-contract-release.mjs /absolute/new/output context-builder-v1`.
   Build twice into new external directories and compare every byte. The explicit
   catalog emits only Context Builder, never republications of the five SDK contracts.
3. Inspect all tracked files in the source bundle. Verify immutable releases are
   enabled. Create an owner-approved draft `contract/context-builder/v1.0.0` at
   the exact merged build commit, attach schema, bundle and manifest. Record owner
   approval, test/audit/license evidence and limitations in release notes.
4. Download draft assets and check every byte against both builds. Publish once,
   then independently fetch release metadata, resolve the tag to its commit and
   download all three assets again. Require `immutable: true`, a non-draft release,
   exact tag/commit, filenames, URIs, media types, byte sizes and SHA-256 matches.
   Never replace assets or move tags; corrections need a new reviewed version.
5. Platform adopts the downloaded manifest plus verified publication metadata in
   a separate reviewed lock, regenerates its validators from the downloaded schema,
   and records the exact source commit. Its old Context Package/SDK lock stays intact.
6. After Platform adoption is merged and CI passes, publish and independently
   verify its implementation artifacts. Only then close #86 and Epic #5.

No npm publication, visibility changes, production source/policy onboarding or
canon promotion. Release scripts do not approve, tag, upload or publish. Approval
of this PR is not evidence that future downloads have already been verified.

Compatibility: exact contract version negotiation remains mandatory. Compatible
corrections require new patch artifacts; additions require reviewed minor versions;
incompatible semantics require a major version and consumer migration. Deprecations
require owner approval, affected-consumer inventory and a dated support window.
Old releases remain available and unchanged; rollback selects a verified release.

For Epic #6/#7, hand off the verified schema/bundle/manifest and Platform artifact
identities, not floating source branches or private fixtures. Preparation, use,
attestation and human publication/canon approvals remain separate.
