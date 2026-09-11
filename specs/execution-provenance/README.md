# Execution Provenance v1

Candidate for Studio #69; owner: @andrewperis. RFC 0005 defines this new
contract. Constitution v1.0.0, commit a9cc8a503aa30e17820edc62ac95f7cbe10e0564,
governs review. Owner merge accepts the candidate; issue #72 remains the
immutable-release gate.

The closed JSON schema is ../../schemas/json/execution-provenance/v1/execution-provenance.schema.json.
An envelope contains `record` and its Studio canonical JSON v1 UTF-8 byte size
and SHA-256 `identity`. Equal explicit inputs produce equal records. A later
structured-output outcome produces a new record identity for the same execution.
Consumers must preserve both revisions when audit history is required.

Records MUST identify the prompt/specification, execution/correlation, requested
target, observed adapter/model, final status, finish reason, timing and reported
usage. Parameters are the numeric portable values after adapter defaults, when
negotiation completed; `not-resolved` MUST distinguish preflight failure.
Stop sequence bodies are omitted; only their count is recorded.

Validation outcomes contain status and counts only. Missing evidence is
`not-run`, never a pass. Structured-output evidence must match the execution
and expectation before its processing id/status can be copied.

`public-only` permits rendered/output byte identities and context slot/package/
source identities only when the associated classification is public. Context
identities also require the overall rendered prompt to be public. `omit`
suppresses all such identities. Non-public contexts contribute only to the
redacted count. Identity fields must contain approved opaque identifiers;
classification and syntactic validation cannot detect a secret disguised as an id.

Bodies, raw output, parsed values, references/URIs, authorization evidence,
provider request ids, idempotency keys, stop strings, extension configuration,
error/warning text, diagnostic paths and arbitrary metadata MUST NOT be emitted.
Even body capture permission in an execution request does not change this rule.
Records are operational evidence, not automatically public release manifests.

Observers accept one immutable metadata record asynchronously. Sink errors and
timeouts MUST remain visible as a static delivery warning without changing the
provider outcome or retrying execution. Default local/test storage is bounded
memory, with snapshot isolation and explicit clearing. Invalid requests that
never begin execution retain the existing validation exception behavior.

This is a new independent contract. Unknown fields/versions fail. Breaking
identity, redaction, or outcome semantics require a new major version; optional
additions require a negotiated minor version. Production implementations and
sink retention/access control belong in Platform and its callers.
