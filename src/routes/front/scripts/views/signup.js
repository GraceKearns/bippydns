import { signUp, fetchSessionStatus } from "../api.js";
export const SignUp = {
    template() {
        return `
        <section class="page-auth">
            <nav-bar></nav-bar>
            <div class="authContainerCardContainer">
                <div class="authContainerCard">
                    <div class="authTitleContainer">
                        <h2 class="authTitle">Sign Up</h2>
                    </div>
                    <div class="authError" id="signup-error"></div>
                    <form class="auth-form" id="signup-form">
                        <label class="auth-label">
                            Email
                            <input class="auth-input" type="email" name="email" required />
                        </label>
                        <label class="auth-label">
                            Password
                            <input class="auth-input" type="password" name="password" required />
                        </label>
                        <label class="auth-label">
                            Confirm Password
                            <input class="auth-input" type="password" name="confirm" required />
                        </label>
                        <button class="auth-btn" type="submit">Sign Up</button>
                    </form>
                    <div class="auth-switch">
                        <span>Already have an account?</span>
                        <a href="#signin" class="auth-link" data-link="/signin">Sign In</a>
                    </div>
                </div>
            </div>
        </section>
        `;
    },
    init() {
        fetchSessionStatus().then(status => {
            if (status.authenticated) {
                window.location.href = '/dashboard';
            }
        }).catch(() => { });
        const form = document.getElementById('signup-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const email = form.email.value;
                const password = form.password.value;
                const confirm = form.confirm.value;
                const errorBox = document.getElementById('signup-error');
                if (errorBox) errorBox.textContent = '';
                if (password !== confirm) {
                    if (errorBox) errorBox.textContent = 'Passwords do not match.';
                    return;
                }
                try {
                    const data = await signUp(email, password);
                    errorBox.textContent = 'An activation link was sent to your inbox.';
                } catch (err) {
                    console.log(err)
                    if (errorBox) errorBox.textContent = err.message || 'Sign up failed.';
                }
            };
        }
    },
    
}
