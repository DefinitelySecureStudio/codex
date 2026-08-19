# Invalid Provider Execution Contract v1 fixtures

- `duplicate-capability.adapter.json` is structurally valid but repeats the
  `text-generation` capability identity.
- `capability-overlap.execution_request.json` repeats `text-generation` across
  required/optional sets and supplies out-of-domain temperature `3`.
- `authentication-retry.execution_result.json` marks a permanent authentication
  failure retryable and has contradictory timing/usage arithmetic.
- `success-with-error.execution_result.json` violates the success union by
  containing both output and error.

Invalid fixtures may fail schema validation, semantic validation, or both. A
conforming consumer rejects every file for at least its named reason and MUST
NOT contact a provider while validating fixtures.
