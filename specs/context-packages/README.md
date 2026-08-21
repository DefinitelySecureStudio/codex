# Context package contracts

Context Package v1 is the stable boundary between a Context Builder and a
Prompt SDK. Builders select, retrieve, minimize, classify, and package context.
Consumers validate one explicit prepared package and bind its named sections to
Prompt Definition slots without querying Canon, Lore, search, or another data
source.

- [`context-package-v1.md`](context-package-v1.md) — normative contract
- [`VERSIONING.md`](VERSIONING.md) — compatibility and release policy
- [`CONTEXT-PACKAGE-V1-CONFORMANCE.md`](CONTEXT-PACKAGE-V1-CONFORMANCE.md) — conformance evidence

Real private packages, source paths, credentials, unpublished Canon, and Lore
must never be committed. Contract fixtures are wholly synthetic.
