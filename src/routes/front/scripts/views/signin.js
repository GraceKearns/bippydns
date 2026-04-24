import { signIn, signUp } from '../api/Authentication.js';
import { navigate } from '../app.js';
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
                    <div class="authError" id="autherror"></div>
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
        const params = new URLSearchParams(window.location.search);
        const nextPath = params.get('next') || '/dashboard';
        const form = document.getElementById("signin-form")
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const email = form.email.value;
                const password = form.password.value;
                const errorBox = document.getElementById('autherror');
                if (errorBox) errorBox.textContent = '';
                try {
                    const data = await signIn(email, password);

                    if (data.unverified) {
                        if (errorBox) errorBox.textContent = 'Account not activated. Please check your email for the activation link.';
                    } else {
                        window.location.href = nextPath;
                    }
                }
                catch (err) {
                    console.log(err)
                    if (errorBox) {
                        errorBox.textContent = err.message || 'Sign in unsuccessful.';
                    }
                }
            }
        }
        document.querySelector('.auth-link').addEventListener('click', () => {
            this.signUp();
        });
        

    },
    signUp() {
        navigate("/signup");
    }

}
