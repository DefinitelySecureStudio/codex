# Conformance fixtures

Execution Provenance v1: `valid/execution-provenance-v1.json` is the synthetic
Platform observer example. `invalid/execution-provenance-v1.json` adds a
forbidden body field; closed-schema validation must reject it (its digest also
no longer matches). Digest tampering is separately tested by Platform.

Synthetic examples that demonstrate contract conformance belong here.

- [`valid/`](valid/) contains inputs that must pass validation.
- [`invalid/`](invalid/) contains inputs that must fail validation for one
  documented reason.

Each fixture should identify its contract and version. Invalid fixtures should
state the expected failure in adjacent metadata or documentation. Never use real
private context, proprietary lore, unpublished canon, credentials, personal
data, or confidential communications.
