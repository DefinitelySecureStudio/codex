# RFC 0004: Structured Output v1

- Status: Accepted by merge
- Authors: Definitely Secure Studio Codex maintainers
- Decision owner: `@andrewperis`
- Date: 2026-08-20
- Issue: [DefinitelySecureStudio/studio#68](https://github.com/DefinitelySecureStudio/studio/issues/68)

## Decision

Adopt a provider-neutral post-execution Structured Output v1 boundary. A
successful document preserves the exact raw response identity/retention,
canonical parsed JSON, independent syntax/schema validation, immutable schema
reference, and provider-constraint mode. A failure document preserves the same
safe provenance and value-free diagnostics without a normalized value.

Provider-native constraints remain an adapter capability and never substitute
for independent consumer validation. The core consumer receives exact schema
artifact bytes from an approved caller and performs no network lookup or repair.

## Rationale

Treating a provider JSON-mode claim as validation can pass malformed or
schema-incompatible data. Replacing the raw response with a parsed object loses
audit identity; retaining only raw text forces every downstream caller to parse
differently. Separate representations preserve both facts and make downstream
use conditional on an explicit validated status.

## Rejected alternatives

- Provider-native typed objects as the core result couple contracts to one SDK.
- Silent repair or default insertion fabricates data the model did not return.
- Fetching schema URIs inside the parser adds ambient network and substitution.
- Returning only exceptions loses durable failure provenance.
- Retaining every raw body ignores classification and retention policy.

## Deferred

Schema publication/resolution, non-JSON formats, repair workflows, streaming
assembly, business-semantic validation, truth/Canon review, and release approval
remain separate responsibilities.
