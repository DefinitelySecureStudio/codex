# JSON schemas

JSON Schema documents belong here, grouped by contract family and major version.
Every schema must parse as JSON and declare the dialect it targets.

- [`prompt-contracts/v1/prompt-definition.schema.json`](prompt-contracts/v1/prompt-definition.schema.json)
  validates Prompt Definition Specification v1.0.0 documents.
- [`execution-contracts/v1/provider-execution.schema.json`](execution-contracts/v1/provider-execution.schema.json)
  validates Provider Execution Contract v1.0.0 descriptors, requests, and results.
- [`context-packages/v1/context-package.schema.json`](context-packages/v1/context-package.schema.json)
  validates Context Package v1.0.0 packages, artifact references, and authorization decisions.
- [`structured-output/v1/structured-output.schema.json`](structured-output/v1/structured-output.schema.json)
  validates Structured Output v1.0.0 results and explicit failures.
