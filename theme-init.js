(() => {
  "use strict";

  let theme = "dark";

  try {
    if (window.localStorage.getItem("cor-theme") === "light") theme = "light";
  } catch {
    // The site still works when storage is unavailable.
  }

  if (theme === "light") document.documentElement.dataset.theme = "light";
  document.querySelector('#theme-color')?.setAttribute("content", theme === "light" ? "#e8e3d8" : "#000000");
})();
