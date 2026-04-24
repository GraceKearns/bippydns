
import { loadCSS } from "../util/loadCSS.js";
import '../components/Nav/Nav.js';
import { getUserRecords,postNewRecord,deleteRecord,updateRecord } from "../api/DashboardRecords.js";
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
                    await postNewRecord(domain);
                    form.reset();
                    await this.fetchData();
                }
                catch (error) {
                    const errorBox = document.getElementById('dashboarderror');
                    if (errorBox) {
                        this.showDashboardError(errorBox, error.message || 'Failed to add domain.');
                    }
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
                            <input class="dashboardInput" type="text" pattern="^[a-zA-Z0-9\\-]+$"  maxLength="255" minlength="1" name="domain" placeholder="example.com" required />
                        </label>
                        <span class="dashboardLabel"> .bippydns.com </span>
                        <button class="dashboardButton" type="submit">Add Domain</button>
                        </div>
                    </form>
                    <div class="dashboardRecords">
                        <h3 class="recordsTitle">Your Domains</h3>
                        <div class="dashboardError" id="dashboarderror"></div>
                        <div class="domainCount">
                            <span id="domainCountNumber">0/5 </span> 
                        </div>
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
        const data = await getUserRecords();
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
                    <td class="ipCell">${item.ipv4 || ''}</td>
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
                tr.querySelector('.deleteButton').addEventListener('click', () => {
                    deleteRecord(item.user_id, item.record_id).then(() => {
                        this.fetchData();
                    }).catch(err => {
                        const errorDiv = document.getElementById('dashboarderror');
                        if (errorDiv) {
                            this.showDashboardError(errorDiv, err.message || 'Failed to delete domain.');
                        }
                    });

                });

                list.appendChild(tr);
            });
        }
        const countEl = document.getElementById('domainCountNumber');
        if (countEl) {
            countEl.textContent = `${data.length}/5`;
        }
    },
    enterEditMode(tr, item) {
        const record_id = item.record_id;
        const ipCell = tr.querySelector('.ipCell');
        const ipv6Cell = tr.querySelector('.ipv6Cell');
        const actions = tr.querySelector('.actions');
        ipCell.innerHTML = `
            <input 
                type="text" 
                class="ipInput" 
                placeholder="${item.ipv4 || ''}"
                pattern="^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$"
                value="${item.ipv4 || ''}"
            />
        `;
        ipv6Cell.innerHTML = `
            <input 
                type="text" 
                class="ipv6Input" 
                placeholder="${item.ipv6 || ''}"
                pattern="^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$"
                value="${item.ipv6 || ''}"
            />
        `;
        actions.innerHTML = `
            <button class="saveButton">Save</button>
        `;
        actions.querySelector('.saveButton').addEventListener('click', async () => {
            const newIp = tr.querySelector('.ipInput').value;
            const newIpv6 = tr.querySelector('.ipv6Input').value;
            await this.saveEdit(item, item.record_id, newIp, newIpv6);
            this.fetchData();
        });
    },
    async saveEdit(item, record_id, newIp, newIpv6) {
        try {
            console.log(record_id, newIp, newIpv6)
            await updateRecord(item.user_id, record_id, newIp, newIpv6);
        } catch (err) {
            console.error('Failed to update', err);
        }
    },

    showDashboardError(element, message) {
        element.classList.remove('dashboardAnimateError');
        void element.offsetWidth;
        element.textContent = message;
        element.classList.add('dashboardAnimateError');
    }


};