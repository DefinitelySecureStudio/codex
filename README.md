# Definitely Secure Studio Codex

Stable specifications and contracts for Definitely Secure Studio systems.

> [!NOTE]
> This repository defines contracts. It does not implement production software
> and it does not own creative canon or private lore.

## Responsibility

`codex` is the authoritative home for stable, implementation-neutral contracts
consumed across Definitely Secure Studio repositories. Its scope includes:

- identifiers and naming rules;
- JSON and YAML schemas;
- taxonomies and controlled vocabularies;
- prompt input/output contracts;
- manifest and context-package specifications;
- asset conventions and validation requirements; and
- RFCs that govern cross-repository technical standards.

Experimental contracts begin in `lab`. Accepted contracts are promoted here
through the RFC and change-control process. Production implementations belong in
`platform`. Public creative canon belongs in `universe`; private or unrevealed
world-building belongs in the private `lore` repository.

The organization-wide ownership model is defined in the
[`studio` repository architecture](https://github.com/DefinitelySecureStudio/studio/blob/main/ARCHITECTURE.md).

## Constitutional alignment

This repository adopts the Definitely Secure Studio Constitution v1.0.0. See
[CONSTITUTION_CONFORMANCE.md](CONSTITUTION_CONFORMANCE.md) for the immutable
reference, exact assessed revision, checklist evidence, and review triggers.

## Repository layout

| Path | Purpose |
| --- | --- |
| [`rfcs/`](rfcs/) | Proposals and durable records for standards decisions |
| [`specs/`](specs/) | Human-readable normative specifications by contract family |
| [`schemas/`](schemas/) | Machine-readable JSON and YAML schemas |
| [`fixtures/`](fixtures/) | Synthetic valid and invalid conformance examples |
| [`docs/`](docs/) | Versioning, compatibility, and change-control policy |
| [`.github/`](.github/) | Contribution and repository workflow templates |

The first prompt contract is the
[Prompt Definition Specification v1.0.0](specs/prompt-contracts/prompt-definition-v1.md),
with its JSON Schema and synthetic conformance fixtures.

Provider-neutral model execution uses the
[Provider Execution Contract v1.0.0](specs/execution-contracts/provider-execution-v1.md),
covering adapter descriptors, requests/results, capability/parameter
negotiation, extensions, and normalized errors.

Prepared runtime context crosses the Context Builder/Prompt SDK boundary through
[Context Package v1.0.0](specs/context-packages/context-package-v1.md), with
exact content/source identity, time-bounded authorization, classification, and
slot-binding semantics.

Machine-readable model responses use
[Structured Output v1.0.0](specs/structured-output/structured-output-v1.md),
which preserves raw identity, canonical parsed data, independent schema
validation, retention, and explicit failure provenance.

## Authority and boundaries

An accepted specification or schema in this repository is the source of truth
for its contract. Consumers reference a released version; they must not maintain
edited local copies as a competing authority.

Do not commit:

- production runtime or application code;
- exploratory prompts, agents, pipelines, or prototypes;
- public story canon, unpublished canon, or proprietary lore;
- real private context packages, credentials, or confidential communications;
  or
- product-specific implementation details that are not part of a shared
  contract.

Examples and fixtures must be synthetic or based only on already-public content.
Specifications may describe how private context is represented without including
real private context.

## Change control

Read [the change-control policy](docs/change-control.md) before proposing a new
contract or modifying an existing one. Contract versions follow the
[versioning and compatibility policy](docs/versioning.md). Breaking changes
require an accepted RFC, a new major contract version, migration guidance, and a
documented compatibility window.

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Report
security vulnerabilities or sensitive disclosures through the private process
in [SECURITY.md](SECURITY.md), not a public issue.

## License

Except where otherwise noted, original work in this repository is licensed
under the [Apache License 2.0](LICENSE). See [NOTICE](NOTICE) for attribution and
important boundaries.

The license does not grant rights to Definitely Secure Studio names, the Prompt
Mark, wordmarks, logos, other brand assets, or proprietary creative material.
Third-party material remains subject to its own terms. Examples and fixtures
must be synthetic, properly licensed, or already public.
