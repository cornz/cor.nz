(() => {
  "use strict";

  const year = document.querySelector("#year");
  const themeSwitch = document.querySelector("#theme-switch");
  const themeColor = document.querySelector("#theme-color");

  const setTheme = (theme, persist = false) => {
    const isLight = theme === "light";

    if (isLight) document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;

    if (themeSwitch) {
      themeSwitch.textContent = isLight ? "[ dark ]" : "[ light ]";
      themeSwitch.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} mode`);
      themeSwitch.setAttribute("aria-pressed", String(isLight));
    }

    themeColor?.setAttribute("content", isLight ? "#e8e3d8" : "#000000");

    if (persist) {
      try {
        window.localStorage.setItem("cor-theme", isLight ? "light" : "dark");
      } catch {
        // The selected theme still applies when storage is unavailable.
      }
    }
  };

  setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  themeSwitch?.addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light", true);
  });

  if (year) year.textContent = String(new Date().getFullYear());
})();
