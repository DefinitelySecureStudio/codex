# RFCs

RFCs propose and record standards decisions that create or materially change a
shared contract.

## Lifecycle

```text
Draft -> Accepted -> Implemented
   |         |
   v         v
Withdrawn  Superseded
```

- **Draft:** open for design and consumer review; not authoritative.
- **Accepted:** the decision is approved and normative implementation work may
  proceed.
- **Implemented:** specifications, schemas, fixtures, and migration guidance are
  published and versioned.
- **Withdrawn:** the proposal will not proceed.
- **Superseded:** a later RFC replaces the decision in whole or in part.

RFC filenames use four-digit numbers and a concise kebab-case title:
`NNNN-short-title.md`. Copy [`0000-template.md`](0000-template.md) when drafting
a proposal. Allocate the next number when the pull request opens; numbers are
never reused.
