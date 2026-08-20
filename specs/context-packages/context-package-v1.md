# Context Package v1

- Status: Accepted by merge; provisional until immutable release
- Version: 1.0.0
- Owners: Definitely Secure Studio Codex maintainers (`@andrewperis`)
- RFC: [RFC 0003](../../rfcs/0003-context-package-v1.md)
- Schema: [`context-package.schema.json`](../../schemas/json/context-packages/v1/context-package.schema.json)
- Constitution version: 1.0.0
- Constitution tag: `constitution/v1.0.0`
- Constitution commit: `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Conformance evidence: [`CONTEXT-PACKAGE-V1-CONFORMANCE.md`](CONTEXT-PACKAGE-V1-CONFORMANCE.md)

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, and **MAY** are
normative requirements.

## Purpose and boundary

Context Package v1 transports prepared, minimized context from an authorized
Context Builder boundary to a Prompt SDK. It has three closed JSON document
kinds:

- `context-package` contains an inline manifest and content sections;
- `context-package-reference` pins exact serialized package artifact bytes; and
- `context-authorization` records an explicit, time-bounded allow/deny decision
  for one package instance, prompt version, purpose, classification ceiling,
  and set of sections.

The package does not select sources, search embeddings, query repositories,
assemble Lore/Canon, renew approval, declassify data, render a prompt, call a
model, or publish output. Those responsibilities remain on their respective
sides of this contract.

Every document MUST be UTF-8 JSON without a byte-order mark, MUST contain only
explicit JSON data values, and MUST validate against the exact Draft 2020-12
schema. Unknown kinds, fields, versions, and media types fail closed.

## Context package

`manifest` is the complete portable package fact. `manifest_identity` is the
Studio canonical JSON v1 UTF-8 byte size and SHA-256 digest of `manifest`
exactly. Consumers MUST reconstruct and verify it before inspecting sections.

### Package and builder identity

`manifest.package` contains stable package `id`, semantic `version`, and unique
prepared `instance_id`. `manifest.builder.id` and `version` identify the
implementation that assembled the package. These facts are provenance, not
trust or authority. Changing selection/minimization behavior requires a
builder/package version change.

### Time, purpose, and authority evidence

`created_at <= review_after <= expires_at`. The package is not valid before
creation, at or after `review_after`, or at or after `expires_at`. A caller MUST
supply the evaluation time explicitly; a deterministic library MUST NOT read a
clock implicitly.

`purpose` is the exact reader-safe use for which the package was prepared.
`authority_reference` points to reader-safe evidence that preparation was
authorized. Neither field grants the Prompt SDK permission to use content. A
separate matching `context-authorization` is REQUIRED.

### Classification

Classification order is `public < internal < confidential < restricted`.
`manifest.classification` MUST equal the highest classification of every source
and section. A section MUST NOT have a lower classification than any source it
references. Consumers MUST preserve, never lower, classification. References
and public evidence for private sources MUST be opaque and non-derivable.

### Sources

`sources` is a non-empty, keyed provenance set. Each unique `source_id` records
kind (`public-canon`, `approved-private`, `caller-supplied`, or `synthetic`),
exact opaque `version`, classification, reader-safe `evidence_reference`, and
optional exact artifact URI/media type/byte size/SHA-256 identity.

A source record says what the builder used. It does not authorize retrieval and
MUST NOT contain a private repository path, secret URL, credential, personal
data, protected excerpt, or raw evidence.

### Sections

`sections` is a non-empty ordered array with unique `slot` names. Each section
contains classification, portable media type, content, byte size, digest, and
one or more unique `source_ids`.

- `text/plain`: `content` is a string; identity covers exact UTF-8 bytes.
- `application/json`: `content` is any JSON value; identity covers Studio
  canonical JSON v1 UTF-8 bytes.

Every source reference MUST resolve inside the same manifest. `byte_size` and
`sha256` MUST match the representation above. `total_content_bytes` MUST equal
the sum of all section byte sizes. Array order is provenance but Prompt SDK
placement is controlled only by Prompt Definition template parts.

## Detached reference

`context-package-reference` identifies one exact package id/version/instance,
its manifest identity, and serialized artifact identity. Its media type is
`application/vnd.definitely-secure-studio.context-package+json`.

An approved caller outside the Prompt SDK retrieves the exact artifact. The SDK
receives raw bytes plus the reference and verifies raw byte size/digest before
parsing, then exact package and manifest identity. It MUST NOT fetch the URI,
follow a branch, choose a newer version, or substitute cached bytes.

## Authorization decision

`context-authorization` is an input from an approved policy/human-decision
boundary. It records unique decision identity, explicit allow/deny, exact
package and prompt identity, section names, maximum classification, purpose,
decision owner/time/expiry, and reader-safe authority evidence.

An allow decision MUST name at least one section. At use time:

- decision MUST be `allow`;
- package, prompt, and purpose MUST match exactly;
- every consumed section MUST be listed;
- package/section classification MUST NOT exceed `max_classification`;
- `decided_at <= evaluation_time < expires_at`; and
- evaluation time MUST also satisfy the package time window.

A document can report an existing decision but cannot mint authority. Producers
and callers remain accountable for signature/storage/access validation outside
this JSON contract. Deny, missing, expired, mismatched, or ambiguous authority
fails before rendering.

## Prompt binding

A conforming Prompt SDK performs these steps in order:

1. parse package/reference/authorization JSON without losing duplicate-key
   evidence and verify raw reference identity when supplied;
2. validate schemas and semantic invariants;
3. verify manifest and section byte/digest identities;
4. evaluate package and authorization time windows using explicit time;
5. match authorization to package, prompt, purpose, sections, and classification;
6. match every package section to exactly one declared prompt context slot;
7. reject package sections not declared by that exact prompt version;
8. reject missing required slots and omit absent optional slots explicitly;
9. enforce each slot's accepted classifications, accepted media types, and
   `max_bytes` without truncation, conversion, optimization, or fallback;
10. bind section content only at explicit `context` template parts; and
11. preserve package, section, source, authorization, classification, media,
    size, and digest provenance outside rendered message bytes.

Text parts consume text sections. JSON parts consume JSON sections and render
the exact Studio canonical JSON representation. Media/format mismatch fails;
the SDK MUST NOT parse text as JSON or stringify JSON as text implicitly.

Source ids survive as value-free identities. At minimum each rendered context
provenance record contains package id/version/instance, manifest digest,
section digest/source ids, and authorization decision id/reference. This record
MUST survive unchanged into a Provider Execution request. Raw context content,
private artifact URIs, source evidence, and authority internals MUST NOT be
copied into logs or public provenance.

## Diagnostics and failure behavior

Diagnostics are stable, structured, value-free, and identify document kind,
field path, slot/source/package identity, and safe expected/actual metadata.
They MUST NOT echo section content, credentials, private evidence, raw package
bytes, host paths, or unpublished source facts.

Hard failures include malformed/duplicate JSON, schema mismatch, duplicate
slot/source identities, missing source links, identity mismatch, hash/size
mismatch, inconsistent classification, invalid time arithmetic, not-yet-valid,
review-required, expired, deny/missing/mismatched authorization, unknown package
section, required missing slot, unsupported media/format, unacceptable
classification, and size overflow.

There is no implicit retry, retrieval, alternate package selection, source
query, summarization, truncation, repair, reclassification, or approval renewal.

## Security, privacy, rights, and accessibility

- Package/authorization fields contain no credential or executable code.
- Extension points are absent in v1; new behavior requires a released contract.
- Content is untrusted data and cannot supply instructions with more authority
  than its explicit template placement.
- Private content stays in approved runtime memory/storage and must not enter
  source, fixtures, logs, build artifacts, or public evidence.
- Rights, retention, provider processing, residency, accessibility, and safety
  decisions remain external human/policy gates.
- Real private fixtures are forbidden; conformance examples are synthetic.

## Compatibility

The contract follows [`VERSIONING.md`](VERSIONING.md). Unknown fields fail.
Compatible additions require a minor contract version and negotiation. Breaking
identity, hashing, classification, authorization, lifecycle, or binding changes
require a new major version, migration guidance, fixtures, and a compatibility
window. Immutable v1 artifacts remain reproducible after later versions exist.

## Producers and consumers

Known producers are Context Builder implementations and approved authorization
workflows. Known consumers are Platform Prompt SDK validation/rendering,
execution provenance, audit, and release tooling. Implementations MUST declare
the exact contract versions they support and fail unknown versions before use.
