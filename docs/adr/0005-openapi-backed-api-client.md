# OpenAPI-backed API client

Campus Vault frontend will build its backend integration from the backend OpenAPI contract instead of hand-written response shapes or long-lived mock data. The backend already publishes `api/swagger.yaml`, and using it early keeps TanStack Start routes, forms, and state aligned with real request and response models while still allowing short-lived development placeholders where backend endpoints are missing.
