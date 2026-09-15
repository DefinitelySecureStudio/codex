# RFC 0006: Context Builder producer contracts

Status: Candidate, accepted by owner merge. Owner: @andrewperis.
Issue: https://github.com/DefinitelySecureStudio/studio/issues/76
Constitution: 1.0.0 at `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`.

Adopt the [Context Builder v1 specification](../specs/context-builder/context-builder-v1.md)
and closed schema as a new independent, unreleased 1.0.0 contract family.
Studio ADR 0017 assigns Codex the producer semantics and Platform the implementation.
This additive family changes no released Prompt Definition or Context Package bytes.

The request pins prompt identity, source/fragment plan, scope, policy and budgets.
Normalized evidence and results retain exact protected lineage. Public receipts
contain opaque attestations only. Preparation verification is separate from exact
package-use authorization and reserved human canon/publication decisions.

Alternatives rejected: extending released Context Package bytes; runtime-owned
schemas; trusting caller allow flags; embedding private source URIs/digests in
public records; permissive unknown fields; token budgets without estimator identity;
and nondeterministic model-assisted selection. Explicit fragment plans cost caller
configuration but make evidence selection and replay inspectable. The initial
lexical policy is intentionally ASCII/text-only; broader language processing
requires a separately versioned policy, not undocumented locale dependence.

Platform maintainers review the consumer proof; source owners retain actual access
authority. Synthetic fixtures and schema/relational tests are acceptance evidence,
not a substitute for production policy, source, assembly or audit implementation.
The runtime follow-ups remain Studio #77–#85; immutable publication is #86.

Merge Codex before the coordinated Platform test consumer. No Prompt SDK migration
is needed: prepared output uses Context Package 1.0.0 and external use authorization.
Production adoption waits for a full immutable release tuple. Rollback drops the
development consumer; existing released contracts remain usable. Review on changes
to authority, classification, identities, source exposure, algorithms or downstream
ownership. No constitutional exception or production data-access approval requested.
