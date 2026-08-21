# RFC 0003: Context Package v1

- Status: Accepted by merge
- Authors: Definitely Secure Studio Codex maintainers
- Decision owner: `@andrewperis`
- Date: 2026-08-20
- Issue: [DefinitelySecureStudio/studio#67](https://github.com/DefinitelySecureStudio/studio/issues/67)

## Decision

Adopt a closed, provider-neutral Context Package v1 boundary with three JSON
document kinds: inline prepared package, detached exact artifact reference, and
explicit scoped authorization decision. Identity uses Studio canonical JSON and
SHA-256; sections carry exact representation identity and source ids.

Prompt SDK consumers validate but never select/retrieve context. Binding is by
declared slot only, with exact purpose/prompt/package/section authorization,
explicit evaluation time, classification/media/size enforcement, and value-free
provenance preserved through execution.

## Rationale

An unstructured map cannot prove package identity, freshness, authority,
classification, source/version provenance, or exact section bytes. Embedding
retrieval in the renderer would collapse the Context Builder and Prompt SDK
trust boundaries and make rendering dependent on hidden state. The selected
design keeps assembly replaceable and consumption deterministic/testable.

## Rejected alternatives

- Raw strings keyed by slot lose identity, provenance, expiry, and authority.
- Prompt SDK retrieval/search assigns Context Builder ownership to the wrong
  component and introduces ambient network/data access.
- Authorization fields inside the package alone let a producer appear to
  authorize its own output.
- Implicit current time makes validation nondeterministic.
- Automatic truncation/summarization/replacement silently changes approved
  content and requires additional model/data authority.

## Deferred

Context selection/retrieval, signatures, encrypted transport, storage access,
watching/renewal, optimization, embeddings, provider processing, [structured
output](0004-structured-output-v1.md), durable provenance emission, and
publication remain separate contracts.
