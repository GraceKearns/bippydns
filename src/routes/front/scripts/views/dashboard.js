
import { loadCSS } from "../util/loadCSS.js";
import '../components/Nav/Nav.js';
import { fetchUserCollections, postNewUserCollection } from "../api.js";
export const Dashboard = {
    async init() {
        loadCSS("/style/dashboard.css", "dashboard-css");
        const form = document.getElementById("dashboardFormAddRecord")
        if (form) {
            console.log(form)
            form.onsubmit = async (e) => {
                e.preventDefault();
                const domain = form.domain.value;
                try {
                    await postNewUserCollection(domain);
                    form.reset();
                    await this.fetchData();
                }
                catch (error) {
                    console.log(error)
                    const list = document.querySelector('.recordsList');
                    if (list) list.innerHTML = `<div class="error">Failed to add domain.</div>`;
                }
            }
        }
        try {
            await this.fetchData();
        }
        catch (error) {
            const list = document.querySelector('.recordsList');
            if (list) list.innerHTML = `<div class="error">Failed to load your domains.</div>`;
        }

    },
    template() {
        return `
        <section class="dashboardPage">
        <nav-bar></nav-bar>
            <div class="dashboardSection">
                <div class="dashboardHeader ">
                        <h2 class="dashboardTitle">Dashboard</h2>
                </div>
                <div class="dashboardBody">
                    <form class="dashboardForm" id="dashboardFormAddRecord">
                        <div> 
                        <label class="dashboardLabel">
                            Domain Name
                            <input class="dashboardInput" type="text" name="domain" placeholder="example.com" required />
                        </label>
                        <span class="dashboardLabel"> .bippydns.com </span>
                        <button class="dashboardButton" type="submit">Add Domain</button>
                        </div>
                    </form>
                    <div class="dashboardRecords">
                        <h3 class="recordsTitle">Your Domains</h3>
                        <table class="recordsTable">
                            <thead>
                                <tr>
                                    <th>Domain</th>
                                    <th>Current IP</th>
                                    <th>IPv6</th>
                                    <th>Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody class="recordsList">
                                <tr><td colspan="5">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
        `;
    },
    async fetchData() {
        const data = await fetchUserCollections();
        if (data.length === 0) {
            const list = document.querySelector('.recordsList');
            if (list) list.innerHTML = `<tr><td colspan="5">No domains added yet.</td></tr>`;
            return;
        }
        const list = document.querySelector('.recordsList');
        if (list) {
            list.innerHTML = '';
            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="domainCell">${item.name}</td>
                    <td class="ipCell">${item.current_ip || ''}</td>
                    <td class="ipv6Cell">${item.ipv6 || ''}</td>
                    <td>${item.updated || ''}</td>
                    <td class="actions">
                        <button class="editButton">Edit</button>
                        <button class="deleteButton">Delete</button>
                    </td>
                `;
                tr.querySelector('.editButton').addEventListener('click', () => {
                    this.enterEditMode(tr, item);
                });

                list.appendChild(tr);
            });
        }
    },
    enterEditMode(tr, item) {
        const ipCell = tr.querySelector('.ipCell');
        const ipv6Cell = tr.querySelector('.ipv6Cell');
        const actions = tr.querySelector('.actions');

        ipCell.innerHTML = `
            <input 
                type="text" 
                class="ip-input" 
                placeholder="${item.current_ip || ''}"
                value="${item.current_ip || ''}"
            />
        `;
        ipv6Cell.innerHTML = `
            <input 
                type="text" 
                class="ipv6-input" 
                placeholder="${item.ipv6 || ''}"
                value="${item.ipv6 || ''}"
            />
        `;
        actions.innerHTML = `
            <button class="saveButton">Save</button>
        `;
        actions.querySelector('.saveButton').addEventListener('click', async () => {
            const newIp = tr.querySelector('.ip-input').value;
            const newIpv6 = tr.querySelector('.ipv6-input').value;
            await this.saveEdit(item, newIp, newIpv6);
            this.fetchData();
        });
    },
    async saveEdit(item, newIp, newIpv6) {
        try {
            await fetch('/update-record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: item.id,
                    ip: newIp,
                    ipv6: newIpv6
                })
            });
        } catch (err) {
            console.error('Failed to update', err);
        }
    }

};