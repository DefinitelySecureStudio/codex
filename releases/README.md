# Prompt SDK v1 release checklist

Owner: @andrewperis. This is issue #72 release preparation, not evidence that
the contracts are already published. Existing provisional notices remain true
until the steps below complete. No release or tag is created by the builder.

The catalog covers Prompt Definition, Provider Execution, Context Package,
Structured Output and Execution Provenance, each at 1.0.0. The first release
normalizes the Context Package schema id to the established version-specific
URN convention; payload semantics are unchanged. Platform must regenerate its
pinned context validator before adopting this unreleased correction.

## Review and build

- [ ] Owner approves and merges the coordinated release PRs.
- [ ] Verify Constitution v1.0.0 alignment, licenses and fixture/publication safety.
- [ ] Run Codex provenance conformance and all Platform tests, including CI.
- [ ] Resolve dependency advisories or record an explicit approved exception.
- [ ] On clean merged Codex main, run
  `node scripts/build-contract-release.mjs /absolute/new/output-directory`.
- [ ] Build twice from the same commit and compare every byte.

The builder reads exact Git blobs, not mutable worktree content. Its deterministic
JSON bundle is a manifest of relative paths, sizes, SHA-256 digests and base64
file bytes. Each bundle contains all tracked reviewed Codex sources, including
specifications, schemas, fixtures, RFCs, license and notices. Consumers decode
only approved relative paths, verify each byte identity and reject traversal or
duplicate paths. The standalone schema asset has its own exact identity tuple.

## Publish contracts (owner-approved, once)

- [ ] Verify GitHub immutable releases are enabled for Codex.
- [ ] For each catalog entry create a **draft** release at
  `contract/<name>/v1.0.0`, targeting the exact merged build commit.
- [ ] Attach its schema, bundle and manifest assets; include owner approval,
  conformance evidence and compatibility/limitation links in release notes.
- [ ] Download the draft assets and compare sizes/digests against the build.
- [ ] Publish each draft once. Verify immutable status and tag commit through
  GitHub; do not move tags, replace assets or silently reuse a released version.
- [ ] Retain the downloaded manifests as Platform's reviewed dependency lock.

For example, after resolving the exact commit and output directory:

```sh
gh release create contract/prompt-definition/v1.0.0 --repo DefinitelySecureStudio/codex --target EXACT_COMMIT --draft --title "Prompt Definition v1.0.0" --notes-file REVIEWED_NOTES.md /absolute/output/prompt-definition-v1.0.0.schema.json /absolute/output/prompt-definition-v1.0.0.bundle.json /absolute/output/prompt-definition-v1.0.0.manifest.json
```

Do not run placeholder commands verbatim. This checklist does not authorize
bypassing repository review or disabling release immutability.

## Finish implementation release

- [ ] Replace Platform provisional pins with complete verified immutable tuples.
- [ ] Change runtime release metadata only after publication verification.
- [ ] Enable stable prompt lifecycle against the verified released contract.
- [ ] Bump package/lock, renderer and structured processor versions together to
  1.0.0; review golden diffs caused by metadata/identity changes.
- [ ] Pass Platform release checks and both Node CI versions.
- [ ] Create its reviewed `prompt-sdk/v1.0.0` release with source/package
  artifacts, sizes/digests, dependency lock and conformance evidence.
- [ ] Verify published artifacts and only then close Studio #72 and Epic #4.

Npm registry publication is not required: the existing package is private and
the release mechanism is GitHub artifacts. Changing registry visibility or
publishing to npm requires a separate explicit owner decision.
