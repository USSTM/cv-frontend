# Approvers own Request approvals

Campus Vault frontend will show Request approval workflows only to Approvers, not Group Admins. The backend grants `approve_all_requests` to Approvers and explicitly excludes approval rights from Group Admins, so the frontend navigation should preserve that separation instead of treating group management as request approval authority.
