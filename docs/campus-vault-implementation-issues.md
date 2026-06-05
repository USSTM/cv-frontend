# Campus Vault implementation issues

Ready-to-publish GitHub issue breakdown for `USSTM/cv-backend` and `USSTM/cv-frontend`.

## 1. Add HTTP-only cookie session auth to backend

Repo: `USSTM/cv-backend`
Type: AFK
Blocked by: None - can start immediately

### What to build

Add HTTP-only cookie session support to Campus Vault backend authentication. OTP verification should issue secure HTTP-only cookies, refresh should renew or rotate those cookies, and logout should clear them. Existing bearer token behavior may remain if useful, but v1 frontend auth depends on cookie-backed sessions.

### Acceptance criteria

- [ ] OTP verification can establish a browser session using HTTP-only cookies.
- [ ] Refresh can renew the session without exposing tokens to JavaScript.
- [ ] Logout clears session cookies.
- [ ] OpenAPI describes the cookie-backed auth behavior.
- [ ] Backend tests cover verify, refresh, and logout cookie behavior.

## 2. Add current Member endpoint

Repo: `USSTM/cv-backend`
Type: AFK
Blocked by: Issue 1

### What to build

Add a current Member endpoint that returns the authenticated Member identity, roles, and group memberships so the frontend can select an Active Group and render role-aware navigation.

### Acceptance criteria

- [ ] Authenticated requests can fetch current Member identity.
- [ ] Response includes roles and group memberships with group id, name, and scoped role information.
- [ ] Members with one group can be auto-selected by the frontend.
- [ ] Members with multiple groups have enough data for an Active Group switcher.
- [ ] OpenAPI and backend tests cover the endpoint.

## 3. Add pre-checkout condition photo upload

Repo: `USSTM/cv-backend`
Type: AFK
Blocked by: Issue 1

### What to build

Add a pre-checkout upload endpoint for Borrow Item condition photos. It should accept an image and return a URL or key usable as `beforeConditionUrl` during Checkout Review.

### Acceptance criteria

- [ ] Authenticated Members can upload a pre-checkout condition photo.
- [ ] Response includes a value accepted by checkout as `beforeConditionUrl`.
- [ ] Upload validates image type and size consistently with existing image handling.
- [ ] OpenAPI and backend tests cover success and validation failures.

## 4. Scaffold TanStack Start frontend with npm, Tailwind, and shadcn

Repo: `USSTM/cv-frontend`
Type: AFK
Blocked by: None - can start immediately

### What to build

Scaffold the Campus Vault frontend using TanStack Start with React, npm, TailwindCSS, and shadcn. Establish the campus operations UI foundation and baseline routes.

### Acceptance criteria

- [ ] App runs locally with npm scripts.
- [ ] TailwindCSS and shadcn are configured.
- [ ] Baseline routes exist for login, catalog, cart, checkout, activity, approvals, admin areas, and settings.
- [ ] Layout follows campus operations UI tone.

## 5. Generate OpenAPI-backed frontend API client

Repo: `USSTM/cv-frontend`
Type: AFK
Blocked by: Issues 1, 2, 3

### What to build

Generate frontend API code from `../backend/api/swagger.yaml` into `src/api/generated/`, then wrap it for authenticated cookie-backed requests and TanStack Query usage.

### Acceptance criteria

- [ ] `npm run api:generate` generates API code from backend OpenAPI.
- [ ] Generated code lives under `src/api/generated/`.
- [ ] Generated files are not edited by hand.
- [ ] API wrapper supports cookie-backed authenticated requests.

## 6. Implement cookie-backed login session

Repo: `USSTM/cv-frontend`
Type: AFK
Blocked by: Issues 1, 2, 4, 5

### What to build

Implement email OTP login, session detection through the current Member endpoint, logout, and route guards using HTTP-only cookie sessions.

### Acceptance criteria

- [ ] Member can request and verify OTP.
- [ ] Successful login establishes a cookie-backed session.
- [ ] Refresh/session detection works without browser-held tokens.
- [ ] Logout clears the session.
- [ ] Protected routes redirect unauthenticated visitors to login.

## 7. Implement role-aware shell and Active Group

Repo: `USSTM/cv-frontend`
Type: AFK
Blocked by: Issue 6

### What to build

Implement the authenticated Campus Vault shell with role-aware navigation and Active Group handling.

### Acceptance criteria

- [ ] Navigation adapts for Member, Group Admin, Approver, and Global Admin.
- [ ] One group is auto-selected as Active Group.
- [ ] Multiple groups show an Active Group switcher.
- [ ] Active Group is visible in group-scoped workflows.

## 8. Implement Catalog and item detail

Repo: `USSTM/cv-frontend`
Type: AFK
Blocked by: Issue 7

### What to build

Implement the global Catalog and item detail screens, using Take Item, Borrow Item, and Request Item labels. Members can add items to the Cart under the Active Group.

### Acceptance criteria

- [ ] Catalog lists backend items with search/filter basics.
- [ ] Item detail displays item information and images when present.
- [ ] Item type labels use domain language.
- [ ] Add-to-Cart uses the Active Group.

## 9. Implement Cart and Checkout Review

Repo: `USSTM/cv-frontend`
Type: AFK
Blocked by: Issues 3, 8

### What to build

Implement group-scoped Cart and Checkout Review. Mixed carts should be grouped by Ready to Take, Borrowing, and Needs Approval, then submitted through one checkout call.

### Acceptance criteria

- [ ] Cart displays items for the Active Group.
- [ ] Checkout Review groups outcomes by Take Item, Borrow Item, and Request Item.
- [ ] Borrow Item checkout collects due date, condition, and uploaded condition photo.
- [ ] Confirmation mirrors backend result buckets and errors.

## 10. Implement My Activity

Repo: `USSTM/cv-frontend`
Type: AFK
Blocked by: Issue 7

### What to build

Implement My Activity with tabs for Bookings, Borrowings, and Requests so Members can track what they are waiting on, what they need to return, and what they requested.

### Acceptance criteria

- [ ] Bookings tab shows Member bookings.
- [ ] Borrowings tab shows active and returned Borrowings.
- [ ] Requests tab shows Request status.
- [ ] Empty and loading states are polished.

## 11. Implement lightweight Notifications

Repo: `USSTM/cv-frontend`
Type: AFK
Blocked by: Issue 6

### What to build

Implement lightweight notification UX without realtime delivery.

### Acceptance criteria

- [ ] Header shows unread notification count.
- [ ] Member can view recent notifications.
- [ ] Member can mark one notification read.
- [ ] Member can mark all notifications read.
- [ ] No websocket or realtime polling is required.

## 12. Implement Approver approvals

Repo: `USSTM/cv-frontend`
Type: AFK
Blocked by: Issue 7

### What to build

Implement Approver-only Approval workflows for pending Requests. Group Admins must not see Approval controls.

### Acceptance criteria

- [ ] Approvers can view pending Requests.
- [ ] Approvers can approve or deny a Request.
- [ ] Approval flow collects required booking fields when approving.
- [ ] Group Admin navigation excludes Approval controls.

## 13. Add Group Admin and Global Admin placeholder shells

Repo: `USSTM/cv-frontend`
Type: AFK
Blocked by: Issue 7

### What to build

Add placeholder shell routes for Group Admin and Global Admin areas without fake functionality.

### Acceptance criteria

- [ ] Group Admin route exists and is visible only to Group Admins where applicable.
- [ ] Global Admin route exists and is visible only to Global Admins.
- [ ] Placeholder screens clearly reserve space for future real workflows.
- [ ] No fake management actions are exposed.
