import "../AuthContainer/AuthContainer.js";
const cssUrl = new URL("./Nav.css", import.meta.url).href
import { authStore } from "../../stores/authStore.js";
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
             <div id="page-title"> 
                <h1>Bippy DNS</h1>
            </div>
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
            </nav>
        `;
        this.attachEvents();
    }
    disconnectedCallback() {
        this.unsubAuth?.();
    }
    attachEvents() {
        // Add event listeners here if needed
    }
}
customElements.define("nav-bar", Nav);