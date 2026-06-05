# HTTP-only cookie sessions for v1 authentication

Campus Vault frontend will use HTTP-only cookie sessions from v1 rather than storing backend-issued access and refresh tokens in browser storage. The backend auth contract should issue, refresh, and clear secure HTTP-only cookies during OTP verification, session refresh, and logout so TanStack Start can support authenticated server loaders and the browser does not expose session tokens to application JavaScript.
