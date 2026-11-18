const scrollPreference = window.matchMedia("(prefers-reduced-motion: no-preference)");
const scrollRoot = document.documentElement;
const scrollArtwork = document.querySelector("[data-hero-art]");
const revealTargets = document.querySelectorAll([
  "main > section.section > :is(.section-heading, h2, .project, .project-list, .about-copy, .questions, .demo, .cv-skills)",
  "main > section.demo-section > :first-child",
  "main .timeline-item"
].join(", "));
const revealed = new WeakSet();
const activeReveals = new Map();
let revealObserver;
let scrollFrame = 0;

function renderScroll() {
  scrollFrame = 0;
  const scrollTop = window.scrollY;
  const scrollable = scrollRoot.scrollHeight - scrollRoot.clientHeight;
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, scrollTop / scrollable)) : 0;
  let drift = 0;

  if (scrollArtwork) {
    const { bottom } = scrollArtwork.getBoundingClientRect();
    const distance = Math.max(bottom + scrollTop, 1);
    drift = Math.min(1, Math.max(0, scrollTop / distance)) * 42;
  }

  scrollRoot.style.setProperty("--scroll-progress", progress);
  scrollArtwork?.style.setProperty("--orbit-drift", `${drift}px`);
}

function queueScroll() {
  if (scrollPreference.matches && !scrollFrame) {
    scrollFrame = window.requestAnimationFrame(renderScroll);
  }
}

function revealOnScroll(entries) {
  for (const { isIntersecting, target } of entries) {
    if (!isIntersecting || !scrollPreference.matches) continue;
    revealObserver.unobserve(target);
    revealed.add(target);
    if (target.matches(":focus-within")) continue;

    const animation = target.animate(
      [{ opacity: .4, transform: "translateY(24px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 560, easing: "cubic-bezier(.17,.75,.28,1)" }
    );
    activeReveals.set(target, animation);
    animation.addEventListener("finish", () => activeReveals.delete(target), { once: true });
  }
}

function syncScrollMotion() {
  if (!scrollPreference.matches) {
    revealObserver?.disconnect();
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
    for (const animation of activeReveals.values()) animation.cancel();
    activeReveals.clear();
    scrollRoot.style.removeProperty("--scroll-progress");
    scrollArtwork?.style.removeProperty("--orbit-drift");
    return;
  }

  queueScroll();
  if (typeof IntersectionObserver !== "function" || typeof Element.prototype.animate !== "function") return;

  revealObserver ??= new IntersectionObserver(revealOnScroll, { rootMargin: "0px 0px -24px" });
  for (const target of revealTargets) {
    if (revealed.has(target) || target.getBoundingClientRect().top < window.innerHeight - 24) continue;
    revealObserver.observe(target);
  }
}

document.addEventListener("focusin", ({ target }) => {
  for (const [element, animation] of activeReveals) {
    if (!element.contains(target)) continue;
    animation.cancel();
    activeReveals.delete(element);
  }
});
window.addEventListener("scroll", queueScroll, { passive: true });
window.addEventListener("resize", queueScroll);
window.addEventListener("pageshow", queueScroll);
if (typeof ResizeObserver === "function") {
  new ResizeObserver(queueScroll).observe(document.body);
}
scrollPreference.addEventListener("change", syncScrollMotion);
syncScrollMotion();
