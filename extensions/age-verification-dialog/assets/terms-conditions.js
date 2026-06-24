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
            updateButtonStyles();
        });

        const buttonSelectors = [
            'button[name="add"]',
            'button.ad-to-cart',
            '#AddToCart',
            '.add-to-cart',
            '.product-form__cart-submit',
            '.shopify-payment-button__button',
            '.shopify-payment-button__button--unbranded',
            'button[name="checkout"]',
            'input[name="checkout"]',
            '[href="/checkout"]',
            '.checkout-button',
            '.product-form__submit',
            '[data-testid="Checkout-button"]'
        ];

        function updateButtonStyles() {
            const isChecked = checkbox.checked;
            const buttons = document.querySelectorAll(buttonSelectors.join(','));
            buttons.forEach(btn => {
                if (isChecked) {
                    btn.classList.remove('avd-button-disabled');
                } else {
                    btn.classList.add('avd-button-disabled');
                }
            });
        }

        // Periodically check for new buttons (sometimes MutationObserver is overkill or throttled)
        // Especially for dynamic payment buttons which load late
        setInterval(updateButtonStyles, 2000);

        // Intercept clicks on buttons (Capturing phase)
        document.addEventListener('click', function (e) {
            const target = e.target;
            if (!target) return;

            const button = target.closest(buttonSelectors.join(','));

            if (button) {
                if (!validate()) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    // Scroll to checkbox if error occurs to make it visible
                    checkbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

        // Initial run
        updateButtonStyles();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAvdTerms);
    } else {
        initAvdTerms();
    }
})();
