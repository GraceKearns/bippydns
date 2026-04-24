import { signIn, resendActivation } from '../api/Authentication.js';
import { navigate } from '../app.js';
import { loadCSS } from "../util/loadCSS.js";
import '../components/Nav/Nav.js';
export const SignIn = {
    template() {
        return `
            <section class="page-auth">
            <nav-bar></nav-bar>
            <div class="authContainerCardContainer">
                <div class="authContainerCard">
                    <div class="authTitleContainer">
                        <h2 class="authTitle">Sign In</h2>
                    </div>
                    <div class="authError" id="errorBox"></div>
                    <div id="resendVerificationContainer">
                        <a href="#" id="resendVerificationLink">Resend verification email</a>
                        <span id="resendVerificationMessage"></span>
                    </div>
                    <form class="auth-form" id="signin-form">
                        <label class="auth-label">
                            Email
                            <input class="auth-input" type="email" name="email" required />
                        </label>
                        <label class="auth-label">
                            Password
                            <input class="auth-input" type="password" name="password" required />
                        </label>
                        <button class="auth-btn" type="submit">Sign In</button>
                    </form>
                    <div class="auth-switch">
                        <span>Don't have an account?</span>
                        <a class="auth-link">Sign Up</a>
                    </div>
                </div>
            </div>
            </section>
            `;
    },
    init() {
        loadCSS("/style/auth.css", "auth-css");
        const params = new URLSearchParams(window.location.search);
        const nextPath = params.get('next') || '/dashboard';

        const form = document.getElementById("signin-form");
        const errorBox = document.getElementById('errorBox');
        const resendContainer = document.getElementById('resendVerificationContainer');
        const resendLink = document.getElementById('resendVerificationLink');
        const resendMsg = document.getElementById('resendVerificationMessage');
        if (!form) return;
        const resetUI = () => {
            if (errorBox) errorBox.textContent = '';
            if (resendContainer) resendContainer.style.display = 'none';
            if (resendMsg) resendMsg.textContent = '';
        };

        const showUnverifiedUI = (email) => {
            if (errorBox) {
                errorBox.textContent = 'Account not activated. Please check your email for the activation link.';
            }
            if (resendContainer) resendContainer.style.display = 'flex';
            if (resendLink) {
                resendLink.onclick = async (ev) => {
                    ev.preventDefault();
                    resendMsg.textContent = '';
                    resendLink.style.pointerEvents = 'none';
                    resendLink.style.opacity = '0.6';
                    try {
                        await resendActivation(email);
                        resendMsg.textContent = 'Verification email sent!';
                    } catch {
                        resendMsg.textContent = 'Failed to resend email.';
                    } finally {
                        setTimeout(() => {
                            resendLink.style.pointerEvents = '';
                            resendLink.style.opacity = '';
                        }, 2000);
                    }
                };
            }
        };

        form.onsubmit = async (e) => {
            e.preventDefault();
            const email = form.email.value;
            const password = form.password.value;
            resetUI();
            try {
                const data = await signIn(email, password);
                if (data.unverified) {
                    showUnverifiedUI(email);
                    return;
                }
                window.location.href = nextPath;
            } catch (err) {
                if (!errorBox) return;
                if (err.message === 'Please verify email') {
                    showUnverifiedUI(email);
                } else {
                    errorBox.textContent = err.message || 'Sign in failed. Please check your credentials.';
                }
            }
        };

        document.querySelector('.auth-link')?.addEventListener('click', () => {
            this.signUp();
        });
    },
    signUp() {
        navigate("/signup");
    }

}
