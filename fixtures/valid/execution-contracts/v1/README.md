# Valid Provider Execution Contract v1 fixtures

- `mock-text.adapter.json` declares one synthetic synchronous text adapter,
  capabilities, portable parameter limits, and a mock extension.
- `text.execution-request.json` invokes that exact target with a verified
  synthetic rendered prompt and explicit caller policy.
- `success.execution_result.json` is a normalized inline text success.
- `rate-limit.execution_result.json` is a conditional-retry provider failure
  with safe provider diagnostic identity.

Each file passes the JSON Schema and normative semantic rules. Together the
adapter/request/result identities are compatible. The fixtures are synthetic
and make no real provider call.
