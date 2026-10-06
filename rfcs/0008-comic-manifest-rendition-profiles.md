# RFC 0008: Comic Manifest rendition profiles

- Status: Draft
- Authors: @andrewperis
- Created: 2026-10-06
- Contract families: Comic Manifest
- Compatibility: Breaking to the unreleased 1.0.0 candidate; no released consumer
- Supersedes: None
- Superseded by: None
- Constitution version: 1.0.0
- Constitution tag: `constitution/v1.0.0`
- Constitution commit: `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Applicable checklist profile: ADR, RFC, and stable specification
- Conformance evidence: [Studio #94](https://github.com/DefinitelySecureStudio/studio/issues/94)
- Decision owner and required A4 reviewers: @andrewperis; Codex and Platform maintainers

## Summary

Complete the rendition requirements for the unreleased Comic Manifest 1.0.0
candidate. Each declared output will use an exact versioned profile with explicit
media type, dimensions, pixel/byte limits and accessibility/rights metadata.
Build-result and public-release output records will repeat those requirements and
be checked for exact compatibility. This proposal does not alter any released
contract or authorize production use.

## Motivation

The #89 candidate already declares output media, dimensions, alternative text,
transcript and rights notice. It does not name an immutable output profile, place
a cap on an individual output, limit pixel count, or require profile metadata to be
preserved in build-result and public-release output records. A consumer therefore
cannot negotiate a known output contract or reject every oversized/incompatible
output from the declared records alone.

The gap belongs in Codex because output profile semantics must be shared before
Platform implements them. Studio #94 also depends on #91 episode identity and #92
immutable references; those contracts remain in force.

## Specification

The unreleased Comic Manifest 1.0.0 candidate will recognize these immutable
profile ID/version pairs:

| Profile ID | Version | Permitted media type(s) | Dimensions | Maximum `max_bytes` |
| --- | --- | --- | --- | ---: |
| `comic-page-image` | `1.0.0` | `image/png`, `image/jpeg`, `image/webp` | Required exact width and height; each at most 8,192 and product at most 33,554,432 pixels | 50,000,000 |
| `comic-portable-document` | `1.0.0` | `application/pdf` | `null` | 50,000,000 |
| `comic-accessible-transcript` | `1.0.0` | `text/plain` | `null` | 131,072 |

Every production rendition MUST explicitly carry `profile: {profile_id,
profile_version}`, one permitted `media_type`, exact target `dimensions` (or
`null`), and a positive `max_bytes` at or below its profile cap. No default,
alias, wildcard, `latest`, downgrade or fallback is permitted. Unknown profile
pairs and cross-profile media/dimension combinations MUST fail. A profile's
meaning and limits are immutable; a changed constraint requires a new profile
version and explicit consumer support.

Every build-result and public-release output MUST repeat the exact profile pair,
declared `max_bytes`, dimensions and accessibility/rights metadata from its
production requirement. Its media type MUST equal the exact media type selected
by the production requirement, even when the profile permits other types; that
selected type MUST also be permitted by the profile. Its dimensions and metadata
MUST match the requirement exactly, and its recorded artifact byte size MUST NOT
exceed `max_bytes`. A complete result MUST include
every required rendition exactly once, MAY omit optional renditions, and MUST NOT
include missing, duplicate or undeclared output IDs. The public release MUST
preserve the selected result's output order and exact public output metadata.

`alt_text`, `transcript` and `rights_notice` MUST be nonempty. Alternative text is
a concise description of relevant visual information. A transcript preserves
ordered dialogue and captions. A rights notice states the intended rights notice
for the output. The exact standard `production_credit`, final title, Universe-
assigned `DS-NNNN` episode identity, release revision/predecessor, canon scope,
destination, audience, purpose and publication time remain required public
metadata. The opaque production UUID and public episode number are different
identities; the number MUST be assigned through Universe's explicit boundary and
MUST NOT be derived from private identity or content.

Declarations are not proof. A supported profile, matching media-type string,
dimension value, size/digest, alt text, transcript, credit or rights notice does
not prove that the bytes decode/render correctly, that descriptions are useful,
that the visible work meets creative or accessibility quality, that credit is
present in the output, that anyone owns or has permission for the material, or
that publication is safe. Consumers verify bytes and actual dimensions. Qualified
humans review creative quality, accessibility, rights, disclosure and publication
under the applicable approval policy. No rendering, lettering, distribution,
rights decision or canon promotion is implemented here.

## Compatibility and migration

The change is breaking against the earlier unreleased #89 1.0.0 candidate because
the closed rendition/output records gain required fields. No released Comic
Manifest exists and no released contract is changed. The accepted candidate schema
will remain `spec_version: "1.0.0"`; the current source must be owner-accepted
before Platform adopts its exact new schema bytes. Existing #90–#93 development
consumers must update their explicit source/schema/fixture pins and validate exact
profile pairs before accepting the candidate. Unknown profile versions fail until
that exact pair is supported.

No change or migration applies to Prompt SDK v1, Context Package v1, Context
Builder v1, or their immutable artifacts. Immutable Comic Manifest release and
production adoption remain separately gated by #99 and complete release review.

## Security and privacy

Profile checking is local and deterministic. It must not retrieve media, follow a
URI, select an alternate artifact or execute a renderer. Output free text, URLs,
filenames, alternative text and rights notices may disclose protected information;
public projection remains allowlisted and requires separate disclosure review.
Production and build-result identities remain protected when their records are
protected. Public numbering and metadata must not expose private identifiers,
source locations, hashes or content-derived fingerprints.

## Rights, provenance, accessibility, and portability

The profile catalog is provider-neutral and uses common media types with explicit
limits. The transcript and alternative-text fields make accessibility inputs
required; reviewer judgment about quality and the output itself remains necessary.
Rights notices communicate declared metadata only. Ownership, licensing,
permission, attribution and third-party rights are A4 human judgments under the
Constitution and are never inferred by schema or fixture success.

## Alternatives considered

- **One mutable `latest` profile:** rejected because consumers could silently
  reinterpret old records after profile changes.
- **Let each manifest invent its own profile semantics:** rejected because a
  record could raise its own limits or declare incompatible media without a
  shared consumer contract.
- **Trust only result byte declarations:** rejected because they do not constrain
  requested output geometry/size or establish media correctness.
- **Treat a rights notice or accessibility string as approval:** rejected because
  data presence cannot replace qualified review or authority.

## Implementation plan

1. Owner-review and merge this normative Codex proposal and its closed schema,
   specification, compatibility note and synthetic fixtures.
2. After that merge, Platform adopts the exact schema source, implements profile
   and cross-record output checks, and adds passing/failing integration fixtures.
3. Keep release/tag publication, immutable artifact verification and production
   use under the separate #99 gates.

## Unresolved questions

No unresolved schema choice is proposed. The exact limits above remain subject to
the decision owner's review before acceptance.
