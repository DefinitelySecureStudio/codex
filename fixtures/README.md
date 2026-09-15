# Conformance fixtures

Context Builder v1: `context-builder-v1.json` and
`context-builder-lexical-v1.json` contain synthetic request, normalized sources,
prepared/failed results, public receipt, prompt, external use authorization and
out-of-band raw inputs/preparation bounds. The surrounding scenario is test data,
not a contract document. Both private-export examples and authorities are fakes.
`context-builder-v1-cases.json` applies one path-array/value overlay per invalid
case and identifies schema, relational semantic or failure-semantic rejection.
Result-content mutations are rehashed to prove that integrity is not association.

```sh
NODE_PATH=../platform/node_modules node --test tests/context-builder.test.cjs tests/execution-provenance.test.cjs
```

Use the sibling Platform lockfile (`npm ci`) for Ajv 8.20.0/ajv-formats 3.0.1.
`tests/support/context-builder-oracle.cjs` is a test-only fixture checker, not
production Builder/authorization/parsing code. After committing, run
`node --test tests/contract-release.test.mjs` on a clean tree for the existing
five-contract bundle reproducibility regression. No release is published by tests.

Execution Provenance v1: `valid/execution-provenance-v1.json` is the synthetic
Platform observer example. `invalid/execution-provenance-v1.json` adds a
forbidden body field; closed-schema validation must reject it (its digest also
no longer matches). Digest tampering is separately tested by Platform.

`execution-provenance-v1-cases.json` contains schema-only overlays on the valid
fixture: `set` uses dotted record paths and `remove` names record fields. These
are not standalone envelopes; digest recomputation is deliberately excluded to
isolate schema rejection. The runner checks policy, parameter boundaries, every
status/finish pair, processing ids and RFC 3339 formats (including invalid dates).
With Platform's locked Ajv 8.20.0 and ajv-formats 3.0.1 installed in a sibling
checkout, run from Codex:

```sh
NODE_PATH=../platform/node_modules node --test tests/execution-provenance.test.cjs
```

Synthetic examples that demonstrate contract conformance belong here.

- [`valid/`](valid/) contains inputs that must pass validation.
- [`invalid/`](invalid/) contains inputs that must fail validation for one
  documented reason.

Each fixture should identify its contract and version. Invalid fixtures should
state the expected failure in adjacent metadata or documentation. Never use real
private context, proprietary lore, unpublished canon, credentials, personal
data, or confidential communications.
