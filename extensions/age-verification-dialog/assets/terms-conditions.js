(function () {
    // Terms & Conditions gate for the storefront — Add to Cart only.
    //
    // The decision is made synchronously from the checkbox when the add-to-cart
    // form is submitted: we intercept the form's `submit` event (identified by its
    // stable `/cart/add` action, not a theme-specific button selector) and block it
    // when the box is unchecked.
    //
    // Buy it now / express checkout is intentionally NOT gated: it bypasses the
    // cart and its own submit event, so it goes straight to checkout. (The former
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

    // Start unchecked on every load so acceptance is never remembered.
    checkbox.checked = false;

    checkbox.addEventListener('change', function () {
        if (checkbox.checked) clearError();
    });

    // Block Add to Cart when the box is unchecked. `form.action` always contains
    // `/cart/add` (a fixed Shopify convention, locale prefixes included), so this
    // needs no theme button/class selector and the checkbox can live anywhere.
    document.addEventListener('submit', function (e) {
        const form = e.target;
        const action = form && form.getAttribute && form.getAttribute('action');
        if (!action || action.indexOf('/cart/add') === -1) return;

        if (!checkbox.checked) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            showError();
            checkbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Checked: let the submit proceed normally.
    }, true);
})();
