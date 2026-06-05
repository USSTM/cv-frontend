# Global Catalog with group-scoped checkout

Campus Vault frontend will present the Catalog as a shared global item list while keeping Cart, Checkout Review, requests, bookings, and borrowings scoped to the member's Active Group. This matches the backend model where items are not owned by groups, but usage records are group-scoped; the UI must keep Active Group visible during cart and checkout flows so members understand which group context receives the activity.
