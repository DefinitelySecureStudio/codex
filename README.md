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

## Repository layout

| Path | Purpose |
| --- | --- |
| [`rfcs/`](rfcs/) | Proposals and durable records for standards decisions |
| [`specs/`](specs/) | Human-readable normative specifications by contract family |
| [`schemas/`](schemas/) | Machine-readable JSON and YAML schemas |
| [`fixtures/`](fixtures/) | Synthetic valid and invalid conformance examples |
| [`docs/`](docs/) | Versioning, compatibility, and change-control policy |
| [`.github/`](.github/) | Contribution and repository workflow templates |

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

## License status

No open-source license has been selected yet. Until the licensing decision in
[studio issue #31](https://github.com/DefinitelySecureStudio/studio/issues/31)
is completed and a license is added, the repository contents remain all rights
reserved. Public visibility does not grant permission to use, copy, modify, or
distribute the specifications or schemas.

© 2026 Definitely Secure Studio. All rights reserved.
