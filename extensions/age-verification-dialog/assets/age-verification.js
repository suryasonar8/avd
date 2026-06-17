(function () {
    function initAgeVerification() {
        const overlay = document.getElementById('age-verification-overlay');
        const agreeBtn = document.getElementById('age-verify-agree');
        const disagreeBtn = document.getElementById('age-verify-disagree');
        const rememberMeCheckbox = document.getElementById('age-verify-remember-me');

        if (!overlay || !agreeBtn || !disagreeBtn) return;

        const cancelAction = overlay.getAttribute('data-cancel-action') || 'redirect';
        const cancelRedirectUrl = overlay.getAttribute('data-cancel-redirect-url') || 'https://www.google.com';
        const cancelErrorMsg = overlay.getAttribute('data-cancel-error-msg') || '';
        const rememberVisitor = overlay.getAttribute('data-remember-visitor') || 'Session only';
        const rememberDays = parseInt(overlay.getAttribute('data-remember-days')) || 30;
        const errorText = document.getElementById('age-verify-error-text');

        function setCookie(name, value, days) {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
        }

        function getCookie(name) {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

        if (!getCookie('avd-age-verified')) {
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        agreeBtn.addEventListener('click', function () {
            let expiryDays = null;

            if (rememberVisitor === 'Days') {
                expiryDays = rememberDays;
            } else if (rememberVisitor === 'Allow visitor to choose') {
                if (rememberMeCheckbox && rememberMeCheckbox.checked) {
                    expiryDays = 365;
                }
            }
            // If 'Session only' or 'Allow visitor to choose' but unchecked, expiryDays remains null (session cookie)

            setCookie('avd-age-verified', 'true', expiryDays);

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
