export const authStore = {
    state: {
        user:null,
        authenticated: false,
        loaded:false
    },
    listners:[],
    set(newState) {
        this.state = {...this.state,...newState};
        this.listners.forEach(fn=>fn(this.state));
    },
    subscribe(fn) {
        this.listners.push(fn);
        fn(this.state);
        return () => {
            this.listners = this.listners.filter(l=>l!==fn);
        };
    }
};