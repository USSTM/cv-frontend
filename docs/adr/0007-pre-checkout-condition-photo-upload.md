# Pre-checkout condition photo upload

Campus Vault frontend will use a backend pre-checkout condition-photo upload endpoint when Borrow Items appear in Checkout Review. This resolves the current ordering mismatch where checkout requires `beforeConditionUrl`, but Borrowing image uploads require a Borrowing ID that only exists after checkout.
