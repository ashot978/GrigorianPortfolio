const artwork = document.querySelector("[data-hero-art]");

if (artwork) {
  const canTilt = window.matchMedia("(any-pointer: fine) and (prefers-reduced-motion: no-preference)");
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;

  function updateTilt() {
    frame = 0;
    const bounds = artwork.getBoundingClientRect();
    const x = (pointerX - bounds.left) / bounds.width - 0.5;
    const y = (pointerY - bounds.top) / bounds.height - 0.5;

    artwork.style.setProperty("--tilt-x", `${-y * 20}deg`);
    artwork.style.setProperty("--tilt-y", `${x * 24}deg`);
  }

  function resetTilt() {
    window.cancelAnimationFrame(frame);
    frame = 0;
    artwork.style.removeProperty("--tilt-x");
    artwork.style.removeProperty("--tilt-y");
  }

  artwork.addEventListener("pointermove", event => {
    if (!canTilt.matches || event.pointerType === "touch") return;
    pointerX = event.clientX;
    pointerY = event.clientY;

    if (!frame) frame = window.requestAnimationFrame(updateTilt);
  }, { passive: true });

  artwork.addEventListener("pointerleave", resetTilt);
  artwork.addEventListener("pointercancel", resetTilt);
  canTilt.addEventListener("change", resetTilt);
}
