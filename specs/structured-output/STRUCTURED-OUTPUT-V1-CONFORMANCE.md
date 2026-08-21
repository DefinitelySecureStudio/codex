# Structured Output v1 conformance

- Status: Candidate pending accountable-owner merge
- Contract: Structured Output v1.0.0
- Constitution: v1.0.0 at `constitution/v1.0.0`, commit `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Scope: result/failure schema, exact schema/raw/normalized identities,
  retention, validation, provider neutrality, diagnostics, fixtures, and docs
  introduced for Studio issue #68
- Owner: `@andrewperis`
- Assessment date: 2026-08-20
- Active exceptions: None
- Residual risk: schema publication/resolution and restricted raw storage remain
  external; immutable issue #72 release artifacts do not yet exist

The contract separates raw evidence from normalized validated data, requires
exact approved schema bytes, makes malformed/schema-invalid output explicit,
and treats provider constraints only as independently verified adapter facts.
Synthetic fixtures plus the coordinated Platform consumer are independent
evidence. Owner merge approves only this revision, not provider output,
business truth, downstream use, deployment, Canon, or publication.
