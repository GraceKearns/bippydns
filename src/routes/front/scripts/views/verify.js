import { activateAccount } from "../api.js";

export function Verify() {
    setTimeout(async () => {
        const statusBox = document.getElementById('verify-status');
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const nextPath = params.get('next') || '/dashboard';
        if (!token) {
            if (statusBox) statusBox.textContent = 'Activation link is missing a token.';
            return;
        }
        try {
            const result = await activateAccount(token);
            if (statusBox) statusBox.textContent = result.message || 'Account activated.';
            const redirectPath = result.authenticated ? nextPath : `/signin?verified=1&next=${encodeURIComponent(nextPath)}`;
            window.location.href = redirectPath;
        } catch (err) {
            if (statusBox) statusBox.textContent = err.message || 'Activation failed.';
        }
    }, 0);

    return `
    <section class="auth-section">
        <h2 class="auth-title">Verifying account</h2>
        <p id="verify-status" style="color: #e255a3; font-weight: bold;">Checking your activation link...</p>
    </section>
    `;
}

if (!document.getElementById('auth-css')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'style/auth.css';
    link.id = 'auth-css';
    document.head.appendChild(link);
}
