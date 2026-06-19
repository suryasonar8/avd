(function () {
    function initAvdTerms() {
        const checkbox = document.getElementById('avd-terms-checkbox');
        const errorMsg = document.getElementById('avd-terms-error');

        if (!checkbox) return;

        function validate() {
            if (!checkbox.checked) {
                if (errorMsg) errorMsg.style.display = 'block';
                checkbox.style.outline = '2px solid #d93025';
                checkbox.style.outlineOffset = '2px';
                return false;
            }
            if (errorMsg) errorMsg.style.display = 'none';
            checkbox.style.outline = 'none';
            return true;
        }

        checkbox.addEventListener('change', function () {
            if (this.checked) {
                if (errorMsg) errorMsg.style.display = 'none';
                checkbox.style.outline = 'none';
            }
        });

        // Intercept clicks on buttons (Capturing phase)
        document.addEventListener('click', function (e) {
            const target = e.target;
            if (!target) return;

            // Specifically target Add to Cart and Checkout buttons
            const isAddToCart = target.matches('button[name="add"], button.ad-to-cart, .shopify-payment-button__button, .shopify-payment-button__button--unbranded');
            const isCheckout = target.matches('button[name="checkout"], input[name="checkout"], [href="/checkout"], .checkout-button');

            if (isAddToCart || isCheckout) {
                if (!validate()) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
            }
        }, true);

        // Intercept form submissions (Capturing phase)
        document.addEventListener('submit', function (e) {
            const form = e.target;
            const action = form.getAttribute('action');

            if (action && (action.includes('/cart/add') || action.includes('/checkout') || action === '/cart')) {
                if (!validate()) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }, true);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAvdTerms);
    } else {
        initAvdTerms();
    }
})();
