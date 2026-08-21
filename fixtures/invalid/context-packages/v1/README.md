# Invalid Context Package v1 fixtures

Each synthetic fixture fails one named semantic invariant:

- `bad-manifest-digest` has an incorrect canonical manifest identity;
- `dangling-source` cites a source id absent from its manifest; and
- `mismatched.context-authorization` targets a different prompt during binding.

Consumers must reject them without echoing section content.
