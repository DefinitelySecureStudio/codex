# Comic Manifest v1

Status: proposed 1.0.0 candidate, **unreleased; not a production dependency**.
Owner: @andrewperis. [RFC 0007](../../rfcs/0007-comic-manifest-v1.md).
[Studio #89](https://github.com/DefinitelySecureStudio/studio/issues/89).
Authority: [Studio ADR 0018](https://github.com/DefinitelySecureStudio/studio/blob/7b5065cef76bea9580609caba356b0d8fe7cc17c/adr/0018-comic-manifest-architecture.md)
and [architecture](https://github.com/DefinitelySecureStudio/studio/blob/7b5065cef76bea9580609caba356b0d8fe7cc17c/comic-manifest/ARCHITECTURE.md).
Constitution: v1.0.0, `constitution/v1.0.0`, Studio commit
`a9cc8a503aa30e17820edc62ac95f7cbe10e0564`. MUST/MUST NOT/SHOULD/MAY are normative.

## Scope, ownership and exact support

The [closed Draft 2020-12 schema](../../schemas/json/comic-manifest/v1/comic-manifest.schema.json)
defines three record kinds: `comic-production`, `comic-build-result`, and
`comic-public-release`. Each carries `spec_version: "1.0.0"`. Its separately
addressable `$defs/approval` defines a detached `comic-approval-binding` envelope;
that envelope is not a fourth production/release state and the root schema does
not accept it. No embedded decision, state flag or schema-valid document grants
access, current package use, publication or canon authority.

Support is negotiated by **exact kind/version**, a deliberate narrower rule than
Codex's general minor-version default. Consumers MUST reject unknown versions,
fields (including nested fields), enum values and unsupported capabilities before
use. No extension maps, defaults, coercion, executable expressions, implicit
schema retrieval or arbitrary JSON data fields are defined in v1. Types and
field-level maxima in the schema are normative.

Codex owns these meanings and synthetic fixtures. Platform implements parsing,
validation, artifact verification, review and safe proposals. Epic #7 produces
results through explicit authorized execution. Universe editors own publication
identity, public records and canon decisions. Production records/results and
restricted linkage live in approved private storage or Lore according to their
classification, never in public tooling repositories. No direct Lore checkout,
source discovery, refresh, fallback credentials or orchestration is authorized.

## Encoding, limits and identity

Inputs MUST be UTF-8 JSON without BOM, duplicate object keys, non-finite numbers,
unpaired surrogates or invalid Unicode. Parsing MUST be bounded before allocation:
maximum 8 MiB per document, depth 32, 100,000 JSON values and 32,768 UTF-8 bytes
per individual string, in addition to schema limits (JSON Schema string lengths
count Unicode code points). Exceeding any bound fails; consumers may advertise
stricter resource bounds before accepting work. No partial document is successful.
Safe diagnostics name a code/stage, not protected values or raw parse excerpts.
Duplicate-key detection and byte/depth limits require a runtime parser, not Ajv
validation of an already-parsed object.

`studio-json-v1` is the existing Studio canonical representation: recursively
sort object keys in ascending UTF-16 code-unit order, preserve array order,
serialize keys/strings/numbers/booleans/null as ECMAScript `JSON.stringify`, use no
insignificant whitespace, UTF-8 and no final newline. Do not normalize Unicode.
Integers in this contract MUST remain in the safe range specified by the schema.
An `identity` records this representation's byte size and SHA-256 with `sha256:`
prefix. It covers the **entire referenced record**, never itself. Raw artifact
size/digest instead cover exact stored bytes; canonical identity does not excuse
transport corruption. Approvals and publication events are detached so they do
not require rewriting the payload being approved.

Production, attempt, result, release, authority and decision identities use random
UUID v4 URNs assigned outside deterministic processing. IDs MUST NOT encode or be
derived from private text, paths, digests, episode numbers or timestamps. Fixture
UUIDs are deliberately fixed synthetic values, not examples of secure issuance.
Panel/text/asset/binding/rendition names are local stable tokens, not global IDs.

Production revision 1 has `previous: null`. Every subsequent revision references
the exact same production ID, revision minus one, and predecessor canonical
identity; the referenced prior bytes MUST verify. New bytes MUST NOT reuse an
existing identity/revision. Panels and text entries are ordered arrays; panel IDs
are unique per production and text IDs unique across its panels. IDs stay stable
for the same element across revisions; deletion/reordering is a new revision,
not renumbering of element identities. Asset, binding and rendition IDs are unique
within their lists. Panel reference arrays are unique and MUST resolve locally.
Captions require null speaker; dialogue requires an explicit speaker. Content is
data, never a command, permission or executable prompt-policy override.

## Inputs and foundation bindings

`inputs.canon` pins input snapshot C(n). Each public `dependency` records repository,
logical semantic version, immutable tag, full commit and artifact URI, media type,
size and SHA-256. Branches, `latest`, mutable tags, version ranges and implicit
alternate sources MUST fail. HTTPS URIs are locations, never permission to fetch;
configured readers MUST verify exact bytes before use and refuse redirects or
locations outside their authorized scope. Equality of tags/digests alone does not
prove authenticity. Public fixtures use `example.invalid` and fake tuples; no test
may fetch them or present them as published releases.

`inputs.dependencies` MUST contain the exact Comic Manifest contract and execution
tool tuples plus every other public contract/tool input. A prompt binding pins
its public reviewed definition artifact, logical id/version and complete canonical
identity. Panel bindings refer only to those reviewed definitions. A contextual
binding additionally pins the exact Context Package id/version/instance, complete
manifest identity, classification, purpose, ordered delivered section names,
Builder result identity, preparation reference and **separate** use-authorization
reference. Sections are unique and must match the actual package exactly.

The verified package, Builder result and prompt bytes MUST satisfy their original
released contracts. Prompt identity/version, Builder output package and request
relationship, package purpose/classification/sections and authorization decision
reference MUST agree. Only Context Package contract 1.0.0 is supported. Context
Package artifact version is its own semantic version; it is not the contract
version. A context-free prompt has `context: null` and implies no context access.
Authored-only production MAY have no prompt bindings.

Preparation authority is verified before reads by the Builder boundary. At actual
use, the consumer MUST independently verify current exact-instance use authority,
including recipient, prompt/version, purpose, sections, classification ceiling,
time and revocation using trusted out-of-band policy. Historical preparation,
matching hashes or the presence of a decision UUID cannot substitute. Unavailable
trust/revocation evidence denies the affected use. Tests use explicit historical
times and synthetic decisions; they do not authorize use today.

Public assets carry full dependency tuples and MUST have public classification.
Protected assets carry only an opaque secure-store handle, media type and expected
size/digest in protected records. A trusted reader resolves the handle to approved
immutable bytes; no public object location is inferred. Asset rights notices and
intended uses need human rights review. Production classification MUST be at least
the maximum of assets and package classifications; result classification MUST be
at least production classification and all actual contributing material. Processing
never lowers classification. A protected-source influence needs disclosure review
regardless of whether it happens to contain an innocuous string.

## Renditions and build results

A production declares at least one required rendition. IDs, required/optional
status, supported media type, dimensions, alt text, transcript and rights notice
are explicit. Images require dimensions; text/PDF use null dimensions in this v1
baseline. The contract does not render or inspect media. Consumers must check
actual media signatures/dimensions and humans must assess accessibility/meaning;
a claimed media type or transcript is insufficient proof. Source editing formats,
layout engines and illustration generation are outside v1.

A result references the exact complete production record and repeats its exact
`inputs`. It carries distinct result/attempt IDs; attempts never mutate production.
Outputs MUST have unique declared rendition IDs and match each requirement's media,
dimensions, alt text, transcript and rights. Raw bytes MUST verify against recorded
size/digest. A result may use HTTPS output locations or protected store UUID handles;
these are never automatically copied into public records. `complete` requires every
required rendition, at least one output and no diagnostics. Optional absent outputs
are allowed; unexpected outputs fail. `partial`/`failed` require a safe diagnostic
and cannot support a release. A successful tool call is not a successful release.

`execution` identifies the actual tool tuple, workflow/run (null run URI means not
available), UTC start/end, ordered transformations, generation evidence,
reproducibility and limitations. Start MUST not exceed finish. The tool tuple MUST
occur in inputs.dependencies. Transformation step IDs are unique; input/output
digests identify actual consumed/produced bytes, not fabricated explanations.
Protected result transformations retain full input digests and set
`private_inputs_withheld: false` and `private_outputs_withheld: false`. Material intermediate outputs require preserved
immutable evidence accessible through authorized restricted provenance. External
model/provider identities and parameter names/values are recorded explicitly;
parameter names are unique within an entry. `unavailable` and `withheld` declare
gaps with limitations, never invented evidence. No generation uses an empty array.
An exact claim is allowed only for controlled reproducible processing; preserved
selected outputs support auditability, not guaranteed external regeneration.

Gates use the ordered vocabulary: editorial, canon-continuity, visual-text,
integrity, provenance, security-privacy, rights, accessibility, packaging. Each
entry supplies disposition, an opaque evidence reference and rationale. Results
may record a unique subset while work is incomplete. Release candidates require
all nine exactly once in that order. A fail, inconclusive or not-run gate prevents
publication eligibility. `not-applicable` requires a qualified recorded rationale
and authorized disposition. V1 defines no release-waiver shortcut. Evidence
freshness and human applicability review remain runtime/reviewer obligations.

## Public release and restricted linkage

A public release is a **candidate payload**, not proof of publication. It carries
release ID, `DS-NNNN` episode identity, revision, exact predecessor or null, public
classification, final title (not `Untitled`), standard Studio credit, declared canon
scope, destination/audience/purpose/publication time, public inputs and outputs,
gates, safe execution evidence and public approver attribution. Creation/validation
of it does not make it active canon or published history.

Universe editors assign permanent episode numbers in canonical publication order
before final approval. Drafts do not allocate numbers. Numbers 0001–9999 are
supported and never reused. Conflicts, exhausted numbering and parallel reservations
stop for editor resolution; v1 defines no automatic allocator or format extension.
Corrections retain episode ID, increment release revision, reference exact prior
bytes and use a new release ID. First release has null predecessor. Reposts and
translations retain episode identity; changed artifacts need new reviewed revisions.

`input_canon` MUST equal production C(n), never a later C(n+1) containing this
release. Public `dependencies` are the ordered, exact-tuple deduplicated sequence
of production dependencies, prompt definitions in binding order, then public asset
dependencies in asset order. They include complete public contract/tool inputs;
protected references are excluded. Public outputs contain the exact selected
result's output list in result order, with identical content identities/requirements
and approved public HTTPS locations. V1 publishes that result's entire selected
output set; a different selection requires a separate result/candidate. Output
identity is independently verifiable without access to private systems.

Public tool, workflow identity, times and reproducibility MUST agree with the
selected result. Public transformations preserve ordered step IDs. They retain only input/output
digests already present in the public dependency, canon or released-output set;
`private_inputs_withheld` and `private_outputs_withheld` explicitly signal omitted
identities. Omission is an approved safe summary, never an invented transformation.
If all inputs or outputs are protected, that public digest list may be empty with
its corresponding flag true. Protected result input/output lists remain nonempty. Other unsafe execution
fields require an explicitly reviewed safe representation or block release; no
heuristic may silently replace provider/model evidence. Public gate evidence uses
separately approved safe handles, not copied private evidence IDs.

Construct public payloads from an allowlist, never by serializing a protected
record and stripping known keys. Private production/result IDs and hashes, Lore
URLs/commits/paths, private package/approval identities, source/object versions and
content-derived fingerprints MUST NOT appear in any public field. Free text, URLs,
filenames, accessibility text, generation parameters, errors and actual output bytes
need disclosure review; a closed schema cannot prove non-leakage.

`private_context` is `{influenced:false}` when no protected context/assets
contributed. Otherwise it contains exactly `influenced:true` and one random,
non-derivable approved `attestation_reference`. An authorized issuer stores a
restricted mapping binding exact production revision, selected result, public
candidate, artifacts and private lineage/authority/retention evidence. Changing
any bound identity invalidates that mapping for the new candidate. The mapping is
outside the public record. Production signing, trust roots, secure storage and
retention/deletion onboarding are separately scoped; no caller-provided mapping
can establish authority. Synthetic scenario `trust`/`linkage` objects are test
harness data, not new normative production schemas.

## Detached approvals, invalidation and events

An approval binding includes exact whole-record `subject` identity, sorted selected
raw artifact digests (empty for production review), exact release `scope`, reviewer
role/actor, decision UUID, UTC decision/expiry and external authority reference.
A binding is necessary evidence, not an authenticated grant. Trusted verification
MUST bind the actual reviewer to the role, subject, scope and decision, check
revocation and current time, and fail closed on missing evidence. It MUST be valid
at the actual action and authorized publication time. Never trust an allow boolean.

The production-reviewer approves the exact production intent for its declared
scope. Publisher and canon-editor decisions bind the exact public release payload
and outputs; protected influence additionally requires disclosure-reviewer approval.
Reserved A4 decisions require actual human review. Multiple roles may be held by
one qualified human only under Studio separation-of-duties policy; the producer
cannot approve itself. Public `approvers` enumerate only public release decisions
(role, actor, decision ID/time); every entry must match a detached binding and
required roles must be present. Private-source approvers remain restricted.
Decision IDs/attribution can be allocated before hashing the candidate; detached
approval signatures do not mutate the candidate to which they bind.

Changes to production content/order, inputs or requirements create a new revision
and invalidate affected production review, results and downstream approval.
Changes to output bytes/selection, metadata, destination, audience, purpose, time,
rights, safe projection or evidence create a new release candidate and fresh
affected validation/approval. Identical byte digests do not preserve permission
after expiry/revocation. Historical facts remain immutable, never current grants.

Constitution §9.1 transitions require explicit evidence: draft → candidate →
gate-complete → approved → published → superseded/withdrawn. A separate publication
event binds the approved payload identity and actual published bytes/time; this
contract does not implement a publisher or prescribe a storage/event API. Final
publication/canon decisions remain Universe-owned A4 gates. Corrections/withdrawals
append events and preserve original records. Expiry blocks new use; historical
publication consequences require owner review, not automatic deletion or rewrite.

## Conformance and follow-up

[Fixture guide](../../fixtures/comic-manifest-v1.md) separates schema checks,
relational checks and authority obligations. The test-only oracle checks bounded
synthetic relationships; it is not production validation and cannot certify trust,
rights, non-leakage, media quality or canon. Platform's companion proof must bind
these records to the unchanged released SDK/Context Package API at explicit time.

#90 implements hardened parsing; #91–#94 implement structural/reference/foundation/
rendition validation; #95 implements revision and approval boundaries; #96 implements
result verification and projection; #97 provides authoring/reference-consumer tools;
#98 consolidates focused conformance; #99 separately releases immutable artifacts.
[Versioning and release boundaries](COMIC-MANIFEST-VERSIONING.md) apply throughout.
No normative gap may be filled by a local Platform schema fork.
