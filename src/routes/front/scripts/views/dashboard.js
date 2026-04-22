
import { loadCSS } from "../util/loadCSS.js";
import '../components/Nav/Nav.js';
export const Dashboard = {
    init() {
        loadCSS("/style/dashboard.css", "dashboard-css");
    },
    template() {
        return `
        <section class="dashboardPage">
        <nav-bar></nav-bar>
            <div class="dashboardSection">
                
                <div class="dashboardHeader">
                 
                        <h2 class="dashboardTitle">Dashboard</h2>
                    
                </div>
                <div class="dashboardBody">
                    <form class="dashboardForm">
                        <div> 
                        <label class="dashboardLabel">
                            Domain Name
                            <input class="dashboardInput" type="text" name="domain" placeholder="example.com" required />
                        </label>
                        <span class="dashboardLabel"> .bippydns.com </span>
                        <button class="dashboardButton" type="submit">Add Domain</button>
                        </div>
                        
                    </form>
                    <p
                    style="color: #e255a3; font-weight: bold; margin-top:1em;">
                    Loading domains...
                    </p>
                </div>
            </div>
        </section>
        `;
    }


};