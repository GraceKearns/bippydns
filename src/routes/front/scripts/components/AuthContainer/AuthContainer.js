import { authStore } from "../../stores/authStore.js";
import { navStore } from "../../stores/navStore.js";
import { navigate } from "../../app.js";
import {signOut} from "../../api.js"; 
const cssUrl = new URL("./AuthContainer.css", import.meta.url).href;
class AuthContainer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.unsubAuth = null;
        this.unsubNav = null;
        this.authenticated = false;
        this.stack = [];
    }
    connectedCallback() {
    this.unsubAuth = authStore.subscribe((state) => {
        if (!state.loaded) return;
        this.authenticated = state.authenticated;
        this.render();
    });

    this.unsubNav = navStore.subscribe((stack) => {
        this.stack = stack;
        this.render();
    });

    this.shadowRoot.addEventListener("click", (e) => {
        const target = e.target;
        if (target.matches("[data-link]")) {
            e.preventDefault();
            navigate(target.dataset.link);
        }

        if (target.id === "signout-btn") {
            this.signOut();
        }

        if (target.id === "signin-btn") {
            this.signIn();
        }

        if (target.id === "signup-btn") {
            this.signUp();
        }
    });
}
    disconnectedCallback() {
        this.unsubAuth?.();
        this.unsubNav?.();
    }

   
    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${cssUrl}">
            <div class="authContainer">
            <div class="header">
                ${this.authenticated
                ? `
                <div class="authenticated"> 
                    <button id="signout-btn" >Sign out</button>
                </div>
                `
                : `<div class="authenticated"> 
                    <button  id="signin-btn">Sign in</button>
                    <button  id="signup-btn">Sign up</button>
                </div>`
            }
            </div>
        `;
        this.attachEvents();
    }

    attachEvents() {
        if (this.authenticated) {
            this.shadowRoot
                .getElementById("signout-btn")
                ?.addEventListener("click", () => this.signOut());
        } else {
            this.shadowRoot
                .getElementById("signin-btn")
                ?.addEventListener("click", () => this.signIn());
            this.shadowRoot
                .getElementById("signup-btn")
                ?.addEventListener("click", () => this.signUp());
        }
    }
    signOut() {
        signOut().then(() => {
            authStore.set({ authenticated: false, user: null });
            if(location.pathname == "/dashboard") {
                navigate("/");
                return;
            }
            navigate(location.pathname);
        }).catch(err => {
            console.error("Sign out failed:", err);
        } );
    }
    signIn() {
       navigate("/signin");
    }
    signUp() {
       navigate("/signup");
    }

}

customElements.define("auth-container", AuthContainer);