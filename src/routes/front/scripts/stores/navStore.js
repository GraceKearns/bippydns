export const navStore = {
    stack:[],
    listeners:[],
    push(path) {
        this.stack.push(path);
        this.notify();
    },
    pop() {
        this.stack.pop();
        this.notify();
    },
    notify() {
        this.listeners.forEach(listener => listener(this.stack));
    },
    subscribe(fn) {
        this.listeners.push(fn);
        fn(this.stack);
        return () => {
            this.listeners = this.listeners.filter(l => l !== fn);
        };
    },
}