(function () {
    function initAgeVerification() {
        const overlay = document.getElementById('age-verification-overlay');
        const agreeBtn = document.getElementById('age-verify-agree');
        const disagreeBtn = document.getElementById('age-verify-disagree');

        if (!overlay || !agreeBtn || !disagreeBtn) return;

        const cancelAction = overlay.getAttribute('data-cancel-action') || 'redirect';
        const cancelRedirectUrl = overlay.getAttribute('data-cancel-redirect-url') || 'https://www.google.com';
        const cancelErrorMsg = overlay.getAttribute('data-cancel-error-msg') || '';
        const errorText = document.getElementById('age-verify-error-text');

        if (!localStorage.getItem('avd-age-verified')) {
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        agreeBtn.addEventListener('click', function () {
            localStorage.setItem('avd-age-verified', 'true');
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        });

        disagreeBtn.addEventListener('click', function () {
            if (cancelAction === 'redirect') {
                window.location.href = cancelRedirectUrl;
            } else if (cancelAction === 'errorMsg') {
                if (errorText) {
                    errorText.textContent = cancelErrorMsg;
                    errorText.style.display = 'block';
                }
            }
        });
    }

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAgeVerification);
    } else {
        initAgeVerification();
    }
})();
