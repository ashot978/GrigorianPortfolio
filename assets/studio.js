const controls = document.querySelector(".demo-controls");

if (controls) {
  const buttons = [...controls.querySelectorAll("[aria-controls]")];
  const pause = controls.querySelector("[data-pause]");
  const device = document.querySelector("[data-device]");
  const timers = [...device.querySelectorAll("[data-timer]")];
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let viewAnimation;
  let interval;
  let elapsed = 0;
  let startedAt = 0;

  function renderTimers() {
    const runningFor = interval === undefined ? 0 : performance.now() - startedAt;
    const elapsedSeconds = Math.floor((elapsed + runningFor) / 1000);

    for (const timer of timers) {
      const remaining = Math.max(0, Number(timer.dataset.timer) - elapsedSeconds);
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor(remaining / 60) % 60;
      const seconds = remaining % 60;

      timer.textContent = [hours, minutes, seconds]
        .map(value => String(value).padStart(2, "0"))
        .join(":");
      timer.dateTime = `PT${hours}H${minutes}M${seconds}S`;
    }
  }

  function setRunning(running) {
    if (interval !== undefined) {
      elapsed += performance.now() - startedAt;
      clearInterval(interval);
      interval = undefined;
    }

    if (running) {
      startedAt = performance.now();
      interval = window.setInterval(renderTimers, 250);
    }

    pause.textContent = running ? "Timervoorbeeld pauzeren" : "Timervoorbeeld starten";
    renderTimers();
  }

  for (const button of buttons) {
    button.addEventListener("click", () => {
      if (button.getAttribute("aria-pressed") === "true") return;

      for (const viewButton of buttons) {
        const selected = viewButton === button;
        viewButton.setAttribute("aria-pressed", String(selected));
        document.getElementById(viewButton.getAttribute("aria-controls")).hidden = !selected;
      }

      viewAnimation?.cancel();
      if (!motion.matches && typeof device.animate === "function") {
        viewAnimation = device.animate(
          [{ opacity: .35, transform: "translateY(7px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" }
        );
      }
    });
  }

  pause.addEventListener("click", () => setRunning(interval === undefined));
  motion.addEventListener("change", event => {
    if (event.matches) {
      viewAnimation?.cancel();
      setRunning(false);
    }
  });

  setRunning(!motion.matches);
  controls.hidden = false;
}
