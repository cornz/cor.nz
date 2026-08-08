(() => {
  "use strict";

  let theme = "light";

  try {
    if (window.localStorage.getItem("cor-theme") === "dark") theme = "dark";
  } catch {
    // The site still works when storage is unavailable.
  }

  if (theme === "light") document.documentElement.dataset.theme = "light";
  document.querySelector('#theme-color')?.setAttribute("content", theme === "light" ? "#e5dac8" : "#090603");
})();
