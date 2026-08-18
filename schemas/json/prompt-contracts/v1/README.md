# Prompt Definition v1 JSON Schema

[`prompt-definition.schema.json`](prompt-definition.schema.json) is the
machine-readable structural contract for Prompt Definition Specification
v1.0.0. Its canonical schema ID is:

```text
urn:definitely-secure:contract:prompt-definition:1.0.0:prompt-definition
```

The schema uses JSON Schema Draft 2020-12 and rejects unknown fields. Semantic
rules such as unique input/context symbols, declared part references,
type-appropriate constraints, output/capability consistency, and extension
fallback behavior are normative in the human-readable specification and will be
implemented by the validator under Studio issue #64.
