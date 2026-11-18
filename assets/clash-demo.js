const clashDemo = document.querySelector("[data-clash-demo]");

if (clashDemo) {
  const previewControls = clashDemo.querySelector(".cth-preview-controls");
  const previewButtons = [...previewControls.querySelectorAll("[data-preview]")];
  const pause = previewControls.querySelector("[data-pause]");
  const screen = clashDemo.querySelector("[data-screen]");
  const masthead = clashDemo.querySelector("[data-masthead]");
  const navigation = clashDemo.querySelector("[data-navigation]");
  const tabs = [...clashDemo.querySelectorAll("[data-tab]")];
  const accountList = clashDemo.querySelector("[data-accounts]");
  const accountButtons = [...accountList.querySelectorAll("[data-account]")];
  const filters = [...clashDemo.querySelectorAll("[data-filter]")];
  const timelineRows = [...clashDemo.querySelectorAll("[data-category]")];
  const collections = clashDemo.querySelector("#cth-collections");
  const collectionAccount = collections.querySelector("[data-collection-account]");
  const collectionTabs = [...collections.querySelectorAll("[data-collection-tab]")];
  const closeCollections = collections.querySelector("[data-close-collections]");
  const overview = clashDemo.querySelector("#cth-overview");
  const timers = [...clashDemo.querySelectorAll("[data-timer]")];
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let collectionOpener;
  let interval;
  let elapsed = 0;
  let startedAt = 0;

  function selectPanel(buttons, selected) {
    for (const button of buttons) {
      const active = button === selected;
      button.setAttribute("aria-pressed", String(active));
      document.getElementById(button.getAttribute("aria-controls")).hidden = !active;
    }
  }

  for (const button of previewButtons) {
    button.addEventListener("click", () => selectPanel(previewButtons, button));
  }

  for (const tab of tabs) {
    tab.disabled = false;
    tab.addEventListener("click", () => {
      selectPanel(tabs, tab);
      const settings = tab.getAttribute("aria-controls") === "cth-settings";
      masthead.hidden = settings;
      screen.toggleAttribute("data-settings", settings);
      screen.scrollTop = 0;
    });
  }

  for (const button of accountButtons) {
    button.disabled = false;
    const detail = document.getElementById(button.getAttribute("aria-controls"));
    const back = detail.querySelector("[data-back]");
    const openCollections = detail.querySelector("[data-open-collections]");

    button.addEventListener("click", () => {
      accountList.hidden = true;
      detail.hidden = false;
      screen.scrollTop = 0;
      back.focus({ preventScroll: true });
    });

    back.addEventListener("click", () => {
      detail.hidden = true;
      accountList.hidden = false;
      button.focus();
    });

    openCollections.addEventListener("click", () => {
      collectionOpener = openCollections;
      collectionAccount.textContent = detail.querySelector("h3").textContent;
      selectPanel(collectionTabs, collectionTabs[0]);
      overview.hidden = true;
      navigation.hidden = true;
      masthead.hidden = true;
      collections.hidden = false;
      screen.scrollTop = 0;
      closeCollections.focus({ preventScroll: true });
    });
  }

  closeCollections.addEventListener("click", () => {
    collections.hidden = true;
    overview.hidden = false;
    masthead.hidden = false;
    navigation.hidden = false;
    collectionOpener?.focus();
  });

  for (const tab of collectionTabs) {
    tab.addEventListener("click", () => selectPanel(collectionTabs, tab));
  }

  for (const button of filters) {
    button.addEventListener("click", () => {
      const category = button.dataset.filter;

      for (const filter of filters) {
        filter.setAttribute("aria-pressed", String(filter === button));
      }

      for (const row of timelineRows) {
        row.hidden = category !== "all" && row.dataset.category !== category;
      }
    });
  }

  const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
  const dateFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const widgetDateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  for (const finish of clashDemo.querySelectorAll("[data-finish]")) {
    const date = new Date(now.getTime() + Number(finish.dataset.finish) * 1000);
    const time = timeFormat.format(date);
    const day = date.toDateString();

    if (finish.dataset.finishFormat === "widget") {
      if (day === now.toDateString()) finish.textContent = time;
      else if (day === tomorrow.toDateString()) finish.textContent = `Tmr ${time}`;
      else finish.textContent = `${widgetDateFormat.format(date)} ${time}`;
    } else if (day === now.toDateString()) {
      finish.textContent = `Today at ${time}`;
    } else if (day === tomorrow.toDateString()) {
      finish.textContent = `Tomorrow at ${time}`;
    } else {
      finish.textContent = `${dateFormat.format(date)} · ${time}`;
    }
  }

  function formatTimer(remaining, format) {
    const totalHours = Math.floor(remaining / 3600);
    const minutes = Math.floor(remaining / 60) % 60;
    const seconds = remaining % 60;
    const pad = value => String(value).padStart(2, "0");

    if (format === "widget") {
      const clock = `${pad(minutes)}:${pad(seconds)}`;
      return totalHours ? `${totalHours}:${clock}` : clock;
    }
    if (format === "helper") {
      if (!remaining) return "Ready";
      const rounded = Math.ceil(remaining / 60);
      const hours = Math.floor(rounded / 60);
      return hours ? `${hours}h${pad(rounded % 60)}` : `${rounded}m`;
    }

    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (remaining < 3600) parts.push(`${seconds}s`);
    return parts.join(" ");
  }

  function renderTimers() {
    const runningFor = interval === undefined ? 0 : performance.now() - startedAt;
    const elapsedSeconds = Math.floor((elapsed + runningFor) / 1000);

    for (const timer of timers) {
      const remaining = Math.max(0, Number(timer.dataset.timer) - elapsedSeconds);
      const label = formatTimer(remaining, timer.dataset.timerFormat);
      if (timer.textContent !== label) timer.textContent = label;
      timer.dateTime = `PT${remaining}S`;
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

    pause.textContent = running ? "Pause sample timers" : "Start sample timers";
    renderTimers();
  }

  pause.addEventListener("click", () => setRunning(interval === undefined));
  motion.addEventListener("change", ({ matches }) => {
    if (matches) setRunning(false);
  });

  setRunning(!motion.matches);
  previewControls.hidden = false;
}
