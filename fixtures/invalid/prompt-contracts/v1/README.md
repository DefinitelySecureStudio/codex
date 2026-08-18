# Invalid Prompt Definition v1 fixtures

Each synthetic fixture MUST fail JSON Schema validation for the single listed
reason:

| Fixture | Expected failure |
| --- | --- |
| `bad-id.prompt.json` | `id` does not use the stable dotted prompt-ID syntax. |
| `required-default.prompt.json` | A required input declares a default. |
| `deprecated-without-record.prompt.json` | Deprecated lifecycle omits its deprecation record. |
| `text-output-schema.prompt.json` | Text output incorrectly carries a JSON output-schema reference. |
| `missing-text-capability.prompt.json` | Required capabilities omit the v1 `text-generation` baseline. |
| `unknown-field.prompt.json` | A closed top-level object contains an unknown field. |
| `bad-extension-namespace.prompt.json` | Extension key is not a dotted namespace. |

Semantic-invalid fixtures for duplicate symbols, unresolved part references,
type-inapplicable constraints, capability/output contradictions, and fallback
policy belong to the validation implementation under Studio issue #64.
