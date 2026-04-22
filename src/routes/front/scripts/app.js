// app.js

import { router, useMiddleware } from "./router.js";
import { fetchSessionStatus } from "./api.js";
import { authStore } from "./stores/authStore.js";
import { navStore } from "./stores/navStore.js";
function redirectIfAuthenticated(nextPath) {
    return (done) => {
        const state = authStore.state;

        if (!state.loaded) {
            // wait until auth is loaded
            const unsubscribe = authStore.subscribe((s) => {
                if (!s.loaded) return;
                unsubscribe();
                if (s.authenticated) {
                    window.location.href = nextPath;
                } else {
                    done();
                }
            });
            return;
        }
        if (state.authenticated) {
            window.location.href = nextPath;
        } else {
            done();
        }
    };
}



useMiddleware("/signin", redirectIfAuthenticated("/dashboard"));
useMiddleware("/signup", redirectIfAuthenticated("/dashboard"));

export function navigate(path) {
    if(window.location.pathname === path) {
        return;
    }
  
    window.history.pushState({}, "", path);
    router(path);
}

window.addEventListener("popstate", () => {
    navStore.pop();
    router(window.location.pathname);
});

document.addEventListener("click", (e) => {
    const target = e.target;
    console.log(target)
    if (target.matches("[data-link]")) {
        e.preventDefault();
        target.classList.remove("flash");
        target.classList.remove("homeButtonAnimation");
        void target.offsetWidth;
        target.classList.add("flash");
        setTimeout(() => {
            target.classList.remove("flash");
            navigate(target.dataset.link);
        }, 1000); 
    }
});

async function initApp() {
    try {
        const status = await fetchSessionStatus();
        authStore.set({
            authenticated: status.authenticated,
            user: status.user || null,
            loaded: true
        });
    } catch {
        authStore.set({
            authenticated: false,
            user: null,
            loaded: true
        });
    }

    router(window.location.pathname);
}

initApp();