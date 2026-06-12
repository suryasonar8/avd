(function () {
    function initAgeVerification() {
        const overlay = document.getElementById('age-verification-overlay');
        const agreeBtn = document.getElementById('age-verify-agree');
        const disagreeBtn = document.getElementById('age-verify-disagree');

        if (!overlay || !agreeBtn || !disagreeBtn) return;

        if (!localStorage.getItem('age-verified')) {
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        agreeBtn.addEventListener('click', function () {
            localStorage.setItem('age-verified', 'true');
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        });

        disagreeBtn.addEventListener('click', function () {
            window.location.href = 'https://www.google.com';
        });
    }

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAgeVerification);
    } else {
        initAgeVerification();
    }
})();
