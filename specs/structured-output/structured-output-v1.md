# Structured Output v1

- Status: Accepted by merge; provisional until immutable release
- Version: 1.0.0
- Owners: Definitely Secure Studio Codex maintainers (`@andrewperis`)
- RFC: [RFC 0004](../../rfcs/0004-structured-output-v1.md)
- Schema: [`structured-output.schema.json`](../../schemas/json/structured-output/v1/structured-output.schema.json)
- Constitution: v1.0.0, tag `constitution/v1.0.0`, commit `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Conformance: [`STRUCTURED-OUTPUT-V1-CONFORMANCE.md`](STRUCTURED-OUTPUT-V1-CONFORMANCE.md)

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, and **MAY** are
normative.

## Boundary

Structured Output v1 consumes one successful Provider Execution result whose
request expects JSON. It parses once and, when declared, validates against exact
approved JSON Schema Draft 2020-12 bytes. It emits either:

- `structured-output-result`, with status `validated` and a normalized value; or
- `structured-output-failure`, with status `failed`, a stage, and value-free
  diagnostics but no normalized value.

The boundary does not call a provider, select or retrieve schemas, repair JSON,
insert defaults, coerce values, retry generation, validate business truth,
approve Canon, or authorize downstream use.

## Inputs and preflight

The consumer MUST receive the exact execution request and result, a caller-set
`processing_id`, raw-retention mode, provider-constraint mode, and—when
`validation` is `json-schema`—the exact schema artifact bytes. It MUST verify:

1. request/result conformance and matching execution identity;
2. successful JSON inline output, or exact caller-supplied bytes for a referenced
   output;
3. raw byte size, media type, classification, and SHA-256 identity;
4. JSON expectation and structured-output capability declaration;
5. schema artifact byte size/SHA-256 and parsed `$id` matching `schema_id`;
6. exact Draft 2020-12 dialect without external network resolution; and
7. raw retention against explicit observability/retention policy.

Any mismatch fails before normalized data exists. Unknown fields, versions,
formats, dialects, and constraint modes fail closed.

## Parsing and normalized identity

V1 supports only `application/json`. Raw bytes MUST be valid UTF-8 without a
byte-order mark and JSON MUST be parsed exactly once with duplicate-key
evidence preserved. Duplicate names and malformed syntax fail; later keys MUST
NOT silently replace earlier keys.

The normalized value is the parsed JSON data without coercion, repair, default
insertion, or removal of unknown properties. `normalized.byte_size` and
`normalized.sha256` cover its Studio canonical JSON v1 UTF-8 bytes. The raw and
normalized digests MAY differ because insignificant JSON whitespace and object
member order are preserved only in raw bytes.

For `json-syntax`, successful parsing is validation. For `json-schema`, the
parsed value MUST also pass the exact referenced schema. Schema validators MUST
disable remote loading; unresolved external references fail `schema-load`.
Annotation/default keywords MUST NOT mutate the instance.

## Raw response retention

`raw` always preserves media type, classification, exact byte size, and digest.
Retention is explicit:

- `inline` also preserves the exact response string;
- `reference` preserves an exact artifact reference with matching identity; or
- `identity-only` preserves no response content or location.

Inline/reference retention requires an explicitly compatible restricted-content
capture policy. Identity-only is the safe baseline. Classification follows the
execution output and MUST NOT be lowered. Raw content, reference locations, and
parsed values MUST NOT appear in diagnostics.

## Schema reference and provenance

The copied `expectation` is the request's exact `expected_output`. A schema
reference contains schema id, repository, contract, semantic version, immutable
tag, full commit, artifact URI, media type, byte size, and SHA-256. The consumer
MUST copy this reference unchanged; parsed `$id` is checked in addition to byte
identity. The contract document never claims it fetched or approved the schema.

`validator` identifies the provider-neutral implementation, version,
`parse-once-validate-v1` algorithm, and Draft 2020-12. `provider_constraint`
records `portable-only`, `provider-native`, or `adapter-emulated`, the
`structured-output` capability, adapter identity when applicable, and the
mandatory fact that output was independently validated.

A provider-native mode can constrain generation but cannot produce a validated
core result by assertion. Adapters remain behind Provider Execution v1; no
provider SDK type, response-format object, or vendor error crosses this contract.

## Failures and diagnostics

Failure stages are `preflight`, `raw-integrity`, `schema-load`,
`schema-integrity`, `parse`, `schema-validation`, `normalization`, and `internal`.
Diagnostics have stable code/message/JSON-Pointer path and optional safe schema
keyword. They MUST NOT echo raw output, parsed values, schema contents, secrets,
provider bodies, private references, or host paths.

Malformed UTF-8/JSON, duplicate keys, raw identity mismatch, failed execution,
wrong media/kind, request/result mismatch, missing or mismatched schema bytes,
unsupported dialect/ref, compilation failure, and instance validation failure
are explicit failures. A failure MUST NOT include `normalized`, claim success,
fabricate absent fields, repair content, or silently fall back from schema to
syntax validation.

## Compatibility and security

The contract follows [`VERSIONING.md`](VERSIONING.md). Adding a media format,
dialect, repair semantics, retention form, or changed identity algorithm is
breaking unless introduced through negotiated compatible fields in a new
version. Schemas and outputs are untrusted data; consumers bound size/resources
outside this portable contract and do not execute schema-supplied code.

Structured validation proves shape only. It does not establish truth, safety,
rights, accessibility, privacy fitness, authority, Canon, or publication
approval. Those remain explicit downstream gates.
