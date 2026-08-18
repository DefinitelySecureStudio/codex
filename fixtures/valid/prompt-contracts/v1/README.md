# Valid Prompt Definition v1 fixtures

These synthetic fixtures MUST validate against Prompt Definition Specification
v1.0.0:

- `minimal-text.prompt.json` exercises a required scalar input and portable text
  output without context or extensions.
- `context-json.prompt.json` exercises explicit prepared context, structured
  input formatting, an approved output-schema reference, and an optional
  namespaced extension with a portable fallback.
- `deprecated.prompt.json` exercises the complete lifecycle deprecation record.

The examples contain no private context, real credentials, unpublished Canon,
or provider account data.
