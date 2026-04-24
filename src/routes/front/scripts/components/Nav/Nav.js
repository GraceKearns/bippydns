import "../AuthContainer/AuthContainer.js";
import { authStore } from "../../stores/authStore.js";
const cssUrl = new URL("./Nav.css", import.meta.url).href

class Nav extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.authenticated = false;
        this.unsubAuth = null;
    }
    connectedCallback() {
        this.unsubAuth = authStore.subscribe((state) => {
            if (!state.loaded) return;
            this.authenticated = state.authenticated;
            this.render();
        });
    }
    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${cssUrl}">

            <nav class="nav">
                <div class="nav-header">
                    <div id="page-title">
                        <h1>Bippy DNS</h1>
                    </div>
                    <button class="nav-dropdown" aria-label="Toggle navigation" aria-expanded="false">
                        <span class="arrow">&#9660;</span>
                    </button>
                </div>

                <div class="nav-links">
                    <div class="nav-left">
                        <a href="/collections" data-link class="nav-logo">
                            <button>Collections</button>
                        </a>
                    </div>

                    ${
                        this.authenticated
                            ? `
                        <a href="/dashboard" data-link class="nav-logo">
                            <button>Dashboard</button>
                        </a>`
                            : ""
                    }

                    <div class="nav-right">
                        <auth-container></auth-container>
                    </div>
                </div>

            </nav>
            `;
        this.attachEvents();
    }
    disconnectedCallback() {
        this.unsubAuth?.();
    }
    attachEvents() {
        // Dropdown arrow toggle for mobile
        const dropdown = this.shadowRoot.querySelector('.nav-dropdown');
        const navLinks = this.shadowRoot.querySelector('.nav-links');
        if (dropdown && navLinks) {
            dropdown.addEventListener('click', () => {
                navLinks.classList.toggle('open');
                const expanded = navLinks.classList.contains('open');
                dropdown.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                dropdown.querySelector('.arrow').style.transform = expanded ? 'rotate(180deg)' : 'rotate(0deg)';
            });
        }
    }
}
customElements.define("nav-bar", Nav);