# RFC 0009: Stable record IDs

- Status: Accepted for application use by owner on 2026-10-26; unreleased
- Authors: @andrewperis
- Created: 2026-10-24
- Contract families: identifiers
- Compatibility: New additive accepted application profile, version 0.1.0; no stable predecessor
- Supersedes: None
- Superseded by: None
- Constitution version: 1.0.0
- Constitution tag: `constitution/v1.0.0`
- Constitution commit: `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Applicable checklist profile: ADR, RFC, and stable specification
- Conformance evidence: [synthetic cases](0009-stable-record-ids/cases.json), [tests](../tests/stable-record-ids.test.cjs)
- Decision owner and required A4 reviewers: @andrewperis; Codex and affected consumer maintainers

## Summary

Define an accepted, reusable application-level naming and identity profile built
on
[RFC 9562](https://www.rfc-editor.org/rfc/rfc9562.html), using UUIDv4 for
character, location, and relationship records.
An ID names the same logical record across edits, display-name changes, and
repository moves. It does not identify exact content bytes or confer authority.
The requirements below define accepted application-profile semantics at
version 0.1.0. This RFC records the owner-approved decision; its review and merge
remain required, and neither the RFC change nor this status releases a bundle,
starts a consumer migration, issues IDs, or approves publication. This is a
local application profile, not an IETF submission, endorsement or
standards-track document. A broader proposal would require a separate review
and submission decision; no external submission is part of this work.

## Motivation and existing-contract inventory

[Identifiers](../specs/ids/README.md) and [taxonomies](../specs/taxonomies/README.md)
currently reserve subject areas without defining a record scheme.
[Context Package v1 sources](../specs/context-packages/context-package-v1.md#sources)
use `source_id`, opaque `version`, classification and evidence for prepared
provenance. Its schema's `safeId` permits 1–200 ASCII characters, beginning with
an alphanumeric and continuing with alphanumerics, dot, underscore, colon or
hyphen. [Context Builder](../specs/context-builder/context-builder-v1.md#explicit-build-request)
already requires opaque UUIDv4 URNs (`urn:uuid:...`) for source and other
preparation identities. Its schema enforces a lowercase, hyphenated v4 layout.
That existing scheme is viable for UUID generation and opacity, but its
source-selection/provenance semantics do not establish persistent record
ownership, rename or retirement rules. This profile reuses UUIDv4 rather than
invent a random-number encoding; it does not alter those URNs or their meanings.
Existing prompt, package, schema, production and artifact identities retain
their own meanings and namespaces.

This profile reuses that safe ASCII repertoire, exact string comparison, and
independent version/content identity rather than add a resolver protocol. Those
existing schemes do not specify persistent record issuance, collision or
rename rules; therefore a small separate application profile is necessary. No
source ID is converted, reserved, replaced or reinterpreted by this RFC.

## Specification (accepted application profile 0.1.0)

### Standards basis and application rules

The UUID suffix follows these pinpoint references to the official RFC:

| Basis | Rule used by this profile |
| --- | --- |
| [RFC 9562 section 4](https://www.rfc-editor.org/rfc/rfc9562.html#section-4) | UUID text uses hexadecimal groups of 8-4-4-4-12 digits separated by hyphens; the RFC permits upper, lower or mixed case. |
| [Section 4.1](https://www.rfc-editor.org/rfc/rfc9562.html#section-4.1) | Variant bits are `10`, giving the fourth group's initial digit `8`, `9`, `a` or `b` in lowercase text. |
| [Section 5.4](https://www.rfc-editor.org/rfc/rfc9562.html#section-5.4) | UUIDv4 has 122 random bits plus four version bits set to `0100` and two variant bits set to `10`; the third group begins with `4`. |
| [Section 6.9](https://www.rfc-editor.org/rfc/rfc9562.html#section-6.9) | Recommends a cryptographically secure pseudorandom generator and suitable generator-state handling, including reseeding on process forks. This profile requires a suitable CSPRNG and fails issuance if unavailable. |

These references define the UUID building block. The typed prefix, lowercase-only
wire convention, exact comparison/no input repair, inventory ownership and atomic
reservation, permanence, reference and record-version rules below are **our
application requirements**, not additional requirements imposed by RFC 9562.
UUID generation itself needs no central registry; our reservation requirement
serves the application inventory. This is not a new UUID version or UUID URN.

### Format and scope

A record ID MUST match exactly:

```text
^record\.(character|location|relationship)\.[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
```

The suffix MUST be a properly generated RFC 9562 UUIDv4 in the standard
hyphenated text form, emitted in lowercase by our application convention.
Producers MUST use conforming UUIDv4 generation per section 5.4, including the
required version/variant bits. Merely inserting hyphens into arbitrary random
bytes is insufficient; a name/content hash with overwritten version bits is
not UUIDv4 generation. Schema validation can check syntax, version and variant,
but cannot establish random generation.
The prefix `record` and three kind tokens are specific to this accepted
application profile. This RFC neither reserves nor changes an existing released
namespace. IDs are opaque: names,
slugs, file paths, chronology, ownership and classification MUST NOT be encoded.
Consumers MUST reject malformed or noncanonical profile IDs rather than trim,
case-fold, normalize or repair them. Lowercase is the producer's serialization
policy, not permission for consumers to rewrite incoming IDs. Uppercase UUIDs
are allowed by RFC 9562 but rejected by this narrower profile. Bare UUIDs,
`urn:uuid:` forms, braces, unhyphenated text and non-v4 values are also outside
this profile. Equality is exact ASCII string equality. The kind is immutable;
the three tokens are record categories, not a world-building taxonomy.

The full string MUST be unique across the Studio record inventory, including
retired IDs and copies in every repository. A copied record retains its ID;
a genuinely distinct record receives a new ID. A foreign inventory import MUST
be checked for collisions before attachment, not silently treated as the same
record because its ID matches. Uniqueness is a semantic requirement; JSON Schema
alone cannot establish it.

### Issuance and collisions

Only an authorized record owner MAY issue an ID. Andrew (@andrewperis) is the
accountable owner of the private, version-controlled record-ID inventory and
the serialized allocation process. Each candidate MUST be generated by a
UUIDv4 generator backed by a CSPRNG, checked against the complete issued and
retired inventory, and included in a reviewed pull request. Before any
candidate allocation, the change MUST document legacy-ID compatibility and a
duplicate check. A candidate is unissued while its pull request is open; it
becomes issued only when the reviewed change is merged. A collision MUST stop
the affected allocation and be escalated to the accountable owner. Do not
silently overwrite, merge or renumber an already-issued ID. Consumers MUST NOT
mint IDs merely because they encounter a missing reference.

The inventory is maintained in the restricted Lore repository through
serialized, owner-reviewed pull requests; no new service or framework is
prescribed. Randomness reduces collision probability; it does not replace a
uniqueness check. Retired IDs remain reserved forever.

A conflict discovered after issuance MUST stop import/update and be escalated
to the accountable owner. Do not silently overwrite, merge or renumber an
already referenced record. An approved remediation must preserve an explicit
old-to-new mapping scoped to the conflicting origin and update affected
references together; an ambiguous old ID MUST NOT resolve automatically.

### Immutability, names and references

An issued ID MUST NOT change when display name, alias, content, path, repository,
visibility or revision changes. Names and aliases are mutable metadata, never
identity or implicit redirects. An ID MUST NOT be reassigned after deletion,
retirement, split or merge. A change of record kind creates a new record with
an explicit migration mapping; split/merge decisions similarly retain retired
IDs and explicit mappings rather than reuse identity. Mappings are owner
reviewed and do not make historical references name a different entity.

A record reference carries the full ID. Relationships have their own persistent
ID and explicit endpoint IDs; they MUST NOT derive identity from endpoint order,
names or a hash of the current relationship text. Endpoints in the minimal
examples are characters or locations. This profile does not define predicates,
cardinality, directionality or a relationship payload schema.

An authorized validator MUST check references against its complete permitted
inventory, including record kind and retirement state. Missing, conflicting,
wrong-kind or retired references MUST fail current-use validation; a validator
with an incomplete inventory MUST report unresolved and MUST NOT claim success.
Historical references MAY retain retired IDs as historical facts. A bare ID
never pins a revision: workflows needing exact content MUST also use their
existing version/artifact digest contract. Access checks precede resolution;
IDs do not grant retrieval, publication, approval, truth or canon status.

Context `source_id` remains provenance identity. An authorized integration MAY
maintain a separate explicit mapping between a source ID/version and record
ID/revision. It MUST NOT assume equality, one-to-one cardinality or automatic
conversion. Do not add record fields to existing closed context schemas.

## Conformance examples

All values in the [cases](0009-stable-record-ids/cases.json) are fabricated.
The [RFC-local schema](0009-stable-record-ids/id.schema.json) validates only
ID strings; it intentionally has no canonical `$id` and is not a released schema.
The UUIDv4 fixtures were generated solely for synthetic tests with Python
`uuid.uuid4()`; they are not issued or reserved record IDs. The cases exercise
text syntax, version/variant rejection, inventory collisions, rename continuity,
relationship references and retirement. The test oracle is conformance evidence, not a
production issuer or a claim that authorization/randomness were verified.
Run `node --test tests/stable-record-ids.test.cjs` or `npm test`.

## Compatibility and migration

This adds accepted 0.1.0 semantics as an unreleased additive family. Released
schemas, bundles, tags, source IDs and artifact namespaces remain unchanged.
Merging this RFC does not publish a release or activate consumer migration.
Candidate consumers are record storage/validation and reference-producing tools;
Context Builder/Prompt SDK would require a separately reviewed integration
only if they consume persistent record references.
@andrewperis owns the decision; affected consumer maintainers must review any
integration before using the profile.

Before a production consumer adopts this profile, inventory its existing
schemes and references without disclosing protected records; preserve compatible
issued identities; document mappings for any incompatible legacy IDs; validate
references and collisions; and obtain owner/consumer review. Any later release
must follow the [versioning policy](../docs/versioning.md). This RFC does not
activate a consumer migration or dated support window. If a consumer later needs
a migration, its separately reviewed plan must define rollout and rollback
dates and retain reservations and mappings so issued IDs are never recycled.

## Security and privacy

Even random IDs can correlate private activity. Public material MUST use wholly
synthetic IDs and examples; do not copy private IDs, names, paths, links,
excerpts or mappings into public fixtures or logs. Inventory access and error
detail must respect classification. An ID's shape proves neither ownership nor
permission. The private inventory and validation evidence remain in restricted
systems; Codex fixtures contain synthetic examples only.

## Rights, provenance, accessibility, and portability

Examples and tests are original synthetic technical material under the repository
license. ASCII IDs and JSON work without a provider, network resolver or vendor
runtime. Interfaces should present readable labels alongside IDs; labels do not
replace exact references. Existing provenance, rights and publication reviews
remain required. No capability extension or constitutional exception is proposed.
This RFC does not assess private content or complete a broader conformance item.

## Alternatives considered

- Reuse context source IDs: preserves syntax but conflates prepared provenance
  with a persistent record and leaves issuance/rename semantics unspecified.
- Derive IDs from names, paths or content hashes: exposes information and changes
  identity on ordinary edits or moves.
- Sequential IDs: require coordinated enumeration and reveal allocation order;
  UUIDv4 suffixes keep the same explicit uniqueness check without that leakage.
- A custom 32-hex random suffix: superseded in this profile by standard
  hyphenated UUIDv4 with explicit version and variant, for interoperability.
- Introduce a resolver/registry service or full record taxonomy: unnecessary for
  this narrow contract; implementation and payload semantics remain separate.

## Accepted operational status

The application profile is accepted at 0.1.0. Andrew (@andrewperis) is
accountable for the restricted, version-controlled inventory. Allocations are
serialized through reviewed pull requests, and candidates remain unissued until
their reviewed change merges. Each allocation must first document compatibility
with legacy IDs and a full duplicate check. An already-issued conflict stops
the affected allocation and is escalated; no silent conversion or renumbering
is allowed.

This status does not create a canonical released schema, immutable bundle or
tag, migration window, production integration, or public creative publication.
The RFC-local schema and synthetic fixtures remain bounded to this RFC;
any release or consumer migration requires its normal separate review and
versioning steps. No private record names, IDs or allocation evidence belong in
this repository.
