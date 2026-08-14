# Change-control policy

## Authority

An accepted, released contract in `codex` is authoritative for consumers. Draft
RFCs and proposed specifications are not stable dependencies.

## Required review path

| Change | RFC required | Version effect | Minimum evidence |
| --- | --- | --- | --- |
| Editorial clarification with no semantic effect | No | Patch | Explanation and link checks |
| Compatible optional field or behavior | Usually | Minor | Updated spec, schema, valid/invalid fixtures, consumer review |
| Breaking or meaning-changing behavior | Yes | Major | Accepted RFC, migration guide, compatibility window, consumer approvals |
| Deprecation or retirement | Yes | Minor announcement; major removal | Replacement path, usage review, dated support window |
| Security correction | Maintainer decision | Appropriate to compatibility impact | Private coordination, affected-consumer plan, disclosure record |

## Acceptance

A normative change is accepted only when:

1. the owning RFC has the required status;
2. specification text, schemas, and fixtures agree;
3. compatibility impact and affected consumers are documented;
4. migration guidance exists for breaking changes;
5. CODEOWNERS approval and required repository reviews are complete; and
6. the changelog records the contract, version, and change class.

## Promotion from the lab

Promotion is a review, not a copy operation. Experimental material must be
reframed as an implementation-neutral contract, stripped of private or
story-specific content, assigned owners and a version, and supported by
conformance fixtures. Production code does not move into this repository.

## Supersession and deprecation

Accepted RFCs and released contract versions remain in history. Mark them as
superseded or deprecated and link both directions; do not rewrite or delete the
old decision. Removal occurs only in a new major version after the documented
compatibility window.
