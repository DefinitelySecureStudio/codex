# Context Package v1 conformance

- Status: Candidate pending accountable-owner merge
- Contract: Context Package v1.0.0
- Constitution: v1.0.0 at tag `constitution/v1.0.0`, commit `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Scope: schema, semantic invariants, package/reference/authorization identity,
  classification, time windows, binding order, failure behavior, fixtures, and
  documentation introduced for Studio issue #67
- Owner: `@andrewperis`
- Assessment date: 2026-08-20
- Active exceptions: None
- Residual risk: signature/storage/access-policy validation remains external;
  the contract is provisional until immutable issue #72 release artifacts exist

The contract separates context selection from consumption, requires explicit
authorization and time evaluation, preserves classification and source/version
identity, fails incompatibility before rendering, and forbids raw private
material in public evidence. Synthetic valid/invalid fixtures and the Platform
consumer provide independent conformance evidence. Owner review and merge
approve only this contract revision, not a Context Builder, private source,
provider, deployment, or publication.
