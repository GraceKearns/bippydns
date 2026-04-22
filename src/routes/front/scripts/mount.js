export function mount(view, root) {
  root.innerHTML = view.template();

  if (view.init) {
    view.init(root);
  }
}