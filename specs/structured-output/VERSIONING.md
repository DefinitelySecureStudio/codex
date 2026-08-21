# Structured output versioning

Structured Output contracts use Semantic Versioning. `spec_version` selects an
exact schema and semantic contract. Unknown fields fail closed.

Changing raw/normalized identity, validation meaning, failure stages,
classification/retention behavior, supported media/dialect, provider neutrality,
or the no-repair rule is breaking and requires a new major version, migration
guidance, compatibility window, and parallel fixtures. Compatible optional
metadata requires a minor version and explicit consumer negotiation.

Released schema/specification/fixture bytes, tags, commits, sizes, and digests
are immutable. Until issue #72 publishes the bundle, exact accepted commit pins
are provisional and release-blocking.
