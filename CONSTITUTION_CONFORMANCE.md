# Constitution conformance record

## Constitutional alignment

- Constitution: [Definitely Secure Studio Constitution v1.0.0](https://github.com/DefinitelySecureStudio/studio/tree/constitution/v1.0.0)
- Constitution tag: `constitution/v1.0.0`
- Constitution commit: [`a9cc8a503aa30e17820edc62ac95f7cbe10e0564`](https://github.com/DefinitelySecureStudio/studio/commit/a9cc8a503aa30e17820edc62ac95f7cbe10e0564)
- Status: `Conforming` (effective only after accountable-owner approval and merge of the adopting pull request)
- Assessed scope: all files at the assessed revision, including contract governance, RFC/specification templates, schema/fixture scaffolds, versioning, and change control
- Excluded scope: future contracts and releases; consumer implementations; empty scaffold paths with no normative artifact
- Accountable owner: [`@andrewperis`](https://github.com/andrewperis), Codex maintainer
- Assessment revision and date: `adf00d907e4a34a271864e4cdd502c30b41076a0`; 2026-08-17
- Checklist revision: `a9cc8a503aa30e17820edc62ac95f7cbe10e0564`
- Applicable profiles: universal; repository and production-system; ADR, RFC, and stable-specification
- Evidence: this record; repository files at the assessed revision; GitHub settings verified 2026-08-17; adoption issue [#3](https://github.com/DefinitelySecureStudio/codex/issues/3); adopting pull request
- Active constitutional exceptions: None
- Residual risk: no released contract or executable validator exists yet, so conformance of future normative artifacts and validation behavior requires artifact-specific assessment
- Next review: 2026-11-17, or before the first contract release and on Constitution, contract authority, compatibility, schema, validator, dependency, visibility, owner, or security-boundary change

Before merge this is a proposed record and the repository remains `Transition
required`. Owner review and merge are the A4 governance approval and record the
adopting commit in GitHub. Sensitive evidence, if later required, remains in a
restricted record with only a reader-safe reference here.

## Findings

| ID | Severity | Disposition | Evidence |
| --- | --- | --- | --- |
| CX-1 | Major | Resolved in adopting change | RFC and specification templates now require the exact Constitution reference, checklist profile, evidence, and decision ownership. |
| CX-2 | Major | Resolved 2026-08-17 | Secret scanning, push protection, vulnerability alerts, and Dependabot security updates were enabled. |
| CX-3 | Minor | Resolved 2026-08-17 | Undocumented Projects was disabled; Wiki and Discussions remain disabled. |
| CX-4 | Advisory | Deferred by scope | No released contract, machine-readable schema, fixture, validator, or release exists; each must pass its applicable profile before acceptance or release. |

## Checklist evidence

`P` means Pass and `N/A` is supported by the stated rationale. IDs follow the
order of the pinned checklist.

### Assessment identity

| ID | Result | Evidence or rationale |
| --- | --- | --- |
| I1 | P | Identity, base revision, public environment, contract audience, scope, and exclusions are exact above. |
| I2 | P | Version, tag, full commit, and checklist revision are pinned. |
| I3 | P | `@andrewperis` owns the assessment and CODEOWNER review; automation proposes and the human approves. |
| I4 | P | Profiles, evidence, time, freshness, status, findings, and triggers are recorded. |
| I5 | P | Public evidence is reader-safe; sensitive reports use private advisories. |

### Universal profile

| ID | Result | Evidence or rationale |
| --- | --- | --- |
| U1 | P | `README.md`, `CODEOWNERS`, and change-control policy identify authoritative contracts and owner. |
| U2 | P | Codex owns implementation-neutral contracts and explicitly defers governance, runtime, Canon, and Lore. |
| U3 | N/A | No agent or automation executes in this revision. |
| U4 | P | Contract acceptance requires owner/CODEOWNER review; templates now identify decision owner and A4 reviewers. |
| U5 | P | Unresolved, breaking, sensitive, or authority-conflicting work stops in RFC/change control. |
| U6 | P | Draft/accepted/released states are distinct; Canon and Lore are prohibited content. |
| U7 | P | `README.md` assigns public Canon to Universe and private Lore to Lore. |
| U8 | N/A | Codex performs no Canon change. |
| U9 | P | Private-context schemas may be described, but real context is prohibited from public source and fixtures. |
| U10 | N/A | No generated creative work is produced. |
| U11 | P | RFC/spec templates, change control, schemas, fixtures, versions, and immutable release tuples define provenance. |
| U12 | P | Templates separate unresolved questions, limitations, validation, and compatibility from accepted facts. |
| U13 | N/A | No nondeterministic generation occurs. |
| U14 | N/A | No released bytes exist at the assessed revision. |
| U15 | P | Protected Git history, RFC status, CODEOWNERS, and release requirements provide attributable evidence. |
| U16 | P | Security and privacy sections, trust boundaries, failure behavior, and private reporting are required. |
| U17 | P | Contracts require minimization and public fixtures; repository settings enforce review. |
| U18 | P | README, CONTRIBUTING, SECURITY, and PR template prohibit secrets and protected context. |
| U19 | P | Classification follows examples, fixtures, logs, schemas, and context-package representations. |
| U20 | N/A | No provider integration or processing exists. |
| U21 | P | CONTRIBUTING requires source, permission, license, notice, and rights-compatible third-party material. |
| U22 | P | Sensitive disclosure and questionable contract security stop public handling and use private reporting. |
| U23 | P | Normative acceptance criteria are independent of implementations and require specs, schemas, fixtures, compatibility, and review. |
| U24 | P | Schema validation is explicitly insufficient without human-readable agreement and owner review. |
| U25 | P | Stable IDs, semantic versions, portable JSON/YAML, fixtures, and immutable bundles define durable control. |
| U26 | P | Specifications must define a provider-neutral baseline and capability-specific extensions. |
| U27 | P | Breaking changes require migration, compatibility window, consumer approvals, and rollback planning. |

### ADR, RFC, and stable-specification profile

| ID | Result | Evidence or rationale |
| --- | --- | --- |
| A1 | P | README and RFC template keep contracts in Codex and exclude Canon, Lore, governance, and implementation ownership. |
| A2 | P | RFC template records context, alternatives, rationale, consequences, constraints, unknowns, owner, and exact Constitution. |
| A3 | P | Specifications require testable normative behavior and implementation-neutral boundaries. |
| A4 | P | Templates and change control cover producers, consumers, negotiation, versioning, deprecation, migration, fixtures, validation, and rollback. |
| A5 | P | Templates now require security, privacy, rights, provenance, accessibility, portability, and failure behavior. |
| A6 | P | Codex authority excludes governance; constitutional meaning must change in Studio, not an RFC. |

### Repository and production-system profile

| ID | Result | Evidence or rationale |
| --- | --- | --- |
| R1 | P | README, architecture link, CODEOWNERS, LICENSE, and NOTICE define responsibility, public visibility, owner, boundary, and license. |
| R2 | P | Protected `main` has required review controls; private reporting and enabled security protections satisfy the repository standard. No dependencies exist yet. |
| R3 | P | Change control requires released immutable bundles with version, commit, size, digest, compatibility, and provenance. |
| R4 | P | Fixtures and examples are synthetic or already public and exclude secrets, Lore, unpublished Canon, and protected context. |
| R5 | P | This file is the required declaration. |

### Assessment outcome

| ID | Result | Evidence or rationale |
| --- | --- | --- |
| O1 | P | CX-1 through CX-4 are classified; no unresolved Blocker or Major remains in assessed scope. |
| O2 | P | Effective status is exactly `Conforming`; proposal remains `Transition required` before merge. |
| O3 | P | Approval covers only the assessed base revision plus the adoption diff. |
| O4 | P | Date and material triggers are explicit above. |

## Approval

The owner approves this exact assessment by reviewing and merging the adopting
pull request. The merge and issue timelines preserve the adopting repository
commit; later contracts and releases require fresh artifact-specific evidence.
