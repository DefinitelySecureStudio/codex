# Context package versioning

Context Package contracts use Semantic Versioning. Document `spec_version`
selects one exact schema and semantic contract. Package `manifest.package.version`
versions producer behavior independently of the contract.

Unknown fields are rejected. Compatible optional fields require a new minor
contract release and consumer negotiation. Any change to canonical identity,
required facts, document kinds, classification order, authorization scope,
expiry semantics, content representation, slot binding, or failure behavior is
breaking and requires a new major version with migration guidance and parallel
fixtures.

Released schemas, specifications, fixtures, tags, commits, sizes, and digests
are immutable. Until issue #72 publishes the bundle, exact accepted commit pins
are provisional and release-blocking.
