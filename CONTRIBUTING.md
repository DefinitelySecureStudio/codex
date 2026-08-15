# Contributing

Changes to the Codex can affect every consuming repository. Proposals should be
small, explicit, testable, and compatible by default.

## Choose the correct change path

- Use a pull request for clarifications, conformance fixtures, and compatible
  corrections that do not change a contract's meaning.
- Use an RFC for a new contract family, a normative behavior change, a breaking
  change, a deprecation, or a decision that affects multiple repositories.
- Keep experiments in `lab` until their contract is stable enough for review.
- Keep production implementations in `platform` and creative content in
  `universe` or `lore` according to its publication boundary.

## Proposal requirements

Every normative change must identify:

1. the contract and current version it affects;
2. whether the change is breaking, compatible, or editorial;
3. affected consumers and owners;
4. migration or rollout requirements;
5. valid and invalid synthetic fixtures; and
6. related RFCs, issues, and implementation work.

Never include credentials, private context, proprietary lore, unpublished canon,
personal data, or confidential communications. Examples, fixtures, screenshots,
and logs must use synthetic or already-public content.

## Pull requests

Complete the pull-request checklist and request review from CODEOWNERS. A change
is not accepted merely because a schema validates; its human-readable
specification, fixtures, compatibility classification, and changelog must agree.

Run all repository validation commands once tooling is introduced. Until then,
validate Markdown links, parse every changed YAML or JSON file, and confirm that
valid fixtures pass while invalid fixtures fail for the documented reason.

## Contributions and licensing

By intentionally submitting a contribution for inclusion, you license it under
the [Apache License 2.0](LICENSE), consistent with section 5 of that license.
You represent that you have the right to submit it. Identify third-party text,
schemas, examples, or other material in the pull request and preserve every
required license and notice; do not submit material with unknown or incompatible
terms.
