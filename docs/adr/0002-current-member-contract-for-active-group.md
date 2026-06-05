# Current member contract for Active Group

Campus Vault frontend will depend on a backend current-member endpoint for the authenticated member's identity, roles, and group memberships, and member flows should wait for that backend contract rather than using a long-lived fake identity model. The app will auto-select the Active Group when the member belongs to one group and show a group switcher when they belong to multiple groups, avoiding hard-coded seed data or admin-only group lookups.
