import Card from '../components/card/card.js';
import { fetchAllRecords } from '../api/Util.js';
import { loadCSS } from "../util/loadCSS.js";
import '../components/Nav/Nav.js';
export const Home = {
    template() {
        return `
        <section class="page-collections">
            <nav-bar></nav-bar>
            <div class="collections-header">
                <h1>Collections</h1>    
                <p>Explore the available collections in Bippy DNS.</p>
            </div>
            <div id="collections-list">Loading...</div>
        </section>
    `;
    },
    async init() {
        loadCSS("/style/home.css", "home-css");
        try {
            const data = await fetchAllRecords();
            const list = document.getElementById('collections-list');
            if (list) {
                list.innerHTML = '';
                data.forEach(item => {
                    list.appendChild(Card({ name: item.name || item }));
                });
            }
        } catch (error) {
            const list = document.getElementById('collections-list');
            if (list) list.innerHTML = `<div class="error">Failed to load collections.</div>`;
        }
    }
}

