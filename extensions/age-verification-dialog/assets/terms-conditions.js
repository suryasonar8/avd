(function () {
    // Terms & Conditions gate for the storefront — Add to Cart (product/cart page)
    // and the Checkout button (cart page).
    //
    // The decision is made synchronously from the checkbox when a form is
    // submitted. We intercept the `submit` event and identify the relevant actions
    // by stable Shopify conventions — never a theme-specific button/class selector:
    //   - Add to Cart: the form action contains `/cart/add`.
    //   - Checkout:    the submit's `submitter` is the Shopify-standard
    //                  `name="checkout"` button (or the action posts to `/checkout`).
    //     This also distinguishes Checkout from a cart-quantity *update* submit, so
    //     editing the cart while unchecked still works.
    //
    // Buy it now / express checkout (Shop Pay, PayPal, ...) is intentionally NOT
    // gated: it bypasses the cart form and its submit event. (The former
    // cart-terms-validation Function was removed because it also blocked Buy it now.)
    const checkbox = document.getElementById('avd-terms-checkbox');
    const errorMsg = document.getElementById('avd-terms-error');
    if (!checkbox) return;

    function showError() {
        if (errorMsg) errorMsg.style.display = 'block';
        checkbox.style.outline = '2px solid #d93025';
        checkbox.style.outlineOffset = '2px';
    }

    function clearError() {
        if (errorMsg) errorMsg.style.display = 'none';
        checkbox.style.outline = 'none';
    }

    function blockIfUnchecked(e) {
        if (checkbox.checked) return; // Checked: let the submit proceed normally.
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        showError();
        checkbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Start unchecked on every load so acceptance is never remembered.
    checkbox.checked = false;

    checkbox.addEventListener('change', function () {
        if (checkbox.checked) clearError();
    });

    document.addEventListener('submit', function (e) {
        const form = e.target;
        const action = (form && form.getAttribute && form.getAttribute('action')) || '';

        const isAddToCart = action.indexOf('/cart/add') !== -1;
        const isCheckout =
            (e.submitter && e.submitter.name === 'checkout') ||
            action.indexOf('/checkout') !== -1;

        if (isAddToCart || isCheckout) blockIfUnchecked(e);
    }, true);
})();
