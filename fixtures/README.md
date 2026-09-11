# Conformance fixtures

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
