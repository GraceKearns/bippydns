// router.js
import { Home } from "./views/home.js";

import { SignUp } from "./views/signup.js";
import { SignIn } from "./views/signin.js";
import { Dashboard } from "./views/dashboard.js";
import { Verify } from "./views/verify.js";
import { navStore } from "./stores/navStore.js";
import { mount } from "./mount.js";

const routes = {
  "/": Home,

  "/signup": SignUp,
  "/signin": SignIn,
  "/dashboard": Dashboard,
  "/verify": Verify,
};

// Middleware support
const middlewares = {};

export function useMiddleware(path, fn) {
  middlewares[path] = fn;
}

export function router(path, { replace = false } = {}) {
  const view = routes[path] || routes["/"];
  const middleware = middlewares[path];
  const app = document.querySelector("#app");

  // ✅ SINGLE SOURCE OF TRUTH
  if (replace) {
    navStore.stack[navStore.stack.length - 1] = path;
    navStore.notify();
  } else {
    if (navStore.stack[navStore.stack.length - 1] !== path) {
      navStore.push(path);
    }
  }

  const render = () => mount(view, app);

  middleware ? middleware(render) : render();
}