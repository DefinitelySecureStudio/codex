# RFC 0005: Execution provenance and observers

Status: Candidate, accepted by owner merge. Owner: @andrewperis.
Issue: https://github.com/DefinitelySecureStudio/studio/issues/69

Adopt Execution Provenance v1 as a closed metadata projection with canonical
identity. Separate observer delivery from provider execution and preserve
explicit validation states. Use public-only content identities by default,
with an omit policy for more restrictive callers. Numeric effective parameters
remain traceable while free-form strings and bodies are excluded.

The consumer is a vendor-neutral observer interface and bounded local/test
implementation. Downstream build/manifest tooling can link execution and
correlation ids and exact record identities. No telemetry vendor or remote
delivery is mandated. Automatic retries on observer failure are excluded.

Synthetic consumer tests verify completeness, redaction, outcome coverage,
canonical identity, isolation, and bounded delivery. This contract does not
approve publication, provider output, or a production sink.
