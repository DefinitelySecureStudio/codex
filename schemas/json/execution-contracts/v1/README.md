# Provider Execution Contract v1 schema

[`provider-execution.schema.json`](provider-execution.schema.json) is the
Draft 2020-12 schema for Provider Execution Contract v1.0.0. Its closed,
discriminated document kinds are:

- `provider-adapter-descriptor`;
- `execution-request`; and
- `execution-result`.

Schema validation is necessary but not sufficient. Implementations also enforce
the cross-document and semantic rules in the
[normative specification](../../../../specs/execution-contracts/provider-execution-v1.md),
including unique capability identities, range/default consistency, rendered-
prompt integrity, target negotiation, timing/usage arithmetic, retry taxonomy,
classification/retention, and extension fallback behavior.
