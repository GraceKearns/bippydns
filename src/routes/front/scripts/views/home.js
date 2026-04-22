// views/home.js
import { loadCSS } from "../util/loadCSS.js";
import '../components/Nav/Nav.js';
export const Home = {
    template() {
        return `
        <section class="page-home">
            <nav-bar></nav-bar>
           
            <section class="homeButtonContainer">
                <article class="viewCollection">
                    <button data-link="/collections" class="homeButton homeButtonAnimation">
                        View Collection
                    </button>
                </article>
                <article class="joinIn">
                    <button data-link="/signup" class="homeButton homeButtonAnimation">
                        Join
                    </button>
                </article>
            </section>
        </section>
        `;
    },

    init() {
        loadCSS("/style/home.css", "home-css");
    }
};