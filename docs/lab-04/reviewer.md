# Lab 4 — Reviewer Log & Peer Review Contract

**Target Repository:** `phatthidawadi/toktickit`  
**Staging Branch:** `lab4-staging`  
**Target Main Branch:** `main`  

---

## 1. Review Workflow Protocol

Every feature Pull Request targeting `lab4-staging` requires formal peer review before merging. Reviews evaluate:
1. **Spec DD Compliance**: Adherence to `docs/lab-04/specification.md`, `ui-spec.md`, and `api-spec.md`.
2. **Test DD & TDD**: Accompanying automated tests in `server/tests/lab-04/`, `client/tests/lab-04/`, or `e2e/lab-04/`.
3. **Security & Authorization**: Server-enforced permissions, no reliance on hidden client controls.
4. **Regression**: Zero breaking changes to Lab 1–3 functionality.
5. **Code Quality**: Clean TypeScript types, no console errors, proper error handling.

---

## 2. Pull Requests Reviewed for Sprint 4

| PR # | Issue | Feature Branch | Author | Reviewer | Verdict | Merged Date |
| :---: | :---: | :--- | :--- | :--- | :---: | :---: |
| **#73** | Issue 26 | `feature/26-doc-spec-tests` | Developer | Peer Reviewer | **Approved** | *(Pending)* |
| **#74** | Issue 27 | `feature/27-actions-taken-foundation` | Developer | Peer Reviewer | **Approved** | 2026-10-16 |
| **#75** | Issue 28 | `feature/28-actions-taken-ui` | Developer | Peer Reviewer | *(Pending)* | *(Pending)* |
| **#76** | Issue 29 | `feature/29-ticket-workflow-resolution-gate` | Developer | Peer Reviewer | *(Pending)* | *(Pending)* |
| **#77** | Issue 30 | `feature/30-role-dashboards` | Developer | Peer Reviewer | *(Pending)* | *(Pending)* |
| **#78** | Issue 31 | `feature/31-final-hardening-regression` | Developer | Peer Reviewer | *(Pending)* | *(Pending)* |
| **#79** | Issue 32 | `release/lab4-release-integration` | Developer | Peer Reviewer | *(Pending)* | *(Pending)* |

---

## 3. Detailed Review Records

### PR #73: Issue 26 — Sprint 4 Engineering Contract Documentation
- **Branch**: `feature/26-doc-spec-tests` $\to$ `lab4-staging`
- **Review Summary**:
  - Validated that `docs/lab-04/` contains `specification.md`, `api-spec.md`, `ui-spec.md`, and `tests.md`.
  - Verified that all 11 required sections in `specification.md` are complete.
  - Confirmed the 8-status transition matrix and advisory resolution gate rules.
  - Verified optimistic concurrency strategy using integer `version` field.
  - Verified 100% traceability from `AC-01` to `AC-16` across all testing layers in `tests.md`.
- **Verdict**: **Approved**

### PR #74: Issue 27 — Actions Taken Foundation (Model, Migration, Seed, APIs, Auth, Concurrency, Tests)
- **Branch**: `feature/27-actions-taken-foundation` $\to$ `lab4-staging`
- **Review Summary**:
  - Schema & Migration: `ActionTaken` model and `ActionTakenStatus` enum added. `Ticket.version` and `ActionTaken.version` implemented. Migration `20261016000000_add_actions_taken_and_version` verified clean and applied.
  - Seed: `server/prisma/seed.ts` seeds 8 tickets across all 8 statuses and 4 ActionTaken records (testing 0, 1, and multiple items) with idempotency and preserves single active admin rule.
  - API Endpoints:
    - `POST /api/tickets/:id/actions`: IT Staff / Admin only, auto `performedById` from session (`req.user.userId`), required follow-up note validation, active staff assignee validation.
    - `GET /api/tickets/:id/actions`: Stable ordering (`actionDateTime asc, id asc`), Requester ownership check, Staff/Admin visibility.
    - `PATCH /api/actions/:id`: Optimistic concurrency check (version mismatch $\to$ 409 `CONCURRENCY_CONFLICT`), increments version on success.
  - Tests: `server/tests/lab-04/actions-taken.api.test.ts` (9 tests covering ACT-API-01 to ACT-API-09). Full server test suite: 19 test files, 93/93 tests passing (0 failures, 100% regression stability).
- **Verdict**: **Approved**
