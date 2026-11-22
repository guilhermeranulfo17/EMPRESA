export function scrollToId(id) {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
