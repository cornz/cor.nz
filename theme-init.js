(() => {
  "use strict";

  try {
    if (window.localStorage.getItem("cor-theme") === "light") {
      document.documentElement.dataset.theme = "light";
    }
  } catch {
    // The site still works when storage is unavailable.
  }
})();
