(() => {
  "use strict";

  const year = document.querySelector("#year");
  const terminalForm = document.querySelector("#terminal-form");
  const terminalInput = document.querySelector("#terminal-input");
  const terminalOutput = document.querySelector("#terminal-output");
  const terminalPanel = document.querySelector("#terminal");
  const terminalHome = terminalPanel?.parentElement;
  const mobileTerminalDock = document.querySelector("#mobile-terminal-dock");
  const siteHeader = document.querySelector(".site-header");
  const compactHeader = document.querySelector("#compact-header");
  const mainNav = document.querySelector(".main-nav");
  const navToggle = document.querySelector("#nav-toggle");
  const themeSwitch = document.querySelector("#theme-switch");
  const themeColor = document.querySelector("#theme-color");
  const mobileLayout = window.matchMedia("(max-width: 640px)");

  const setNavOpen = (isOpen) => {
    mainNav?.classList.toggle("is-open", isOpen);
    navToggle?.setAttribute("aria-expanded", String(isOpen));
  };

  let compactThreshold = Number.POSITIVE_INFINITY;

  const updateCompactHeader = () => {
    const isCompact = window.scrollY >= compactThreshold;
    mainNav?.classList.toggle("is-compact", isCompact);
    compactHeader?.classList.toggle("is-visible", isCompact);
    compactHeader?.setAttribute("aria-hidden", String(!isCompact));
  };

  const measureCompactThreshold = () => {
    if (!siteHeader || !compactHeader) return;
    const headerTop = siteHeader.getBoundingClientRect().top + window.scrollY;
    compactThreshold = Math.max(1, headerTop + siteHeader.offsetHeight - compactHeader.offsetHeight);
    updateCompactHeader();
  };

  window.requestAnimationFrame(measureCompactThreshold);
  window.addEventListener("resize", measureCompactThreshold);
  window.addEventListener("pageshow", measureCompactThreshold);
  window.addEventListener("scroll", updateCompactHeader, { passive: true });

  const syncResponsiveLayout = () => {
    if (terminalPanel && terminalHome && mobileTerminalDock) {
      (mobileLayout.matches ? mobileTerminalDock : terminalHome).append(terminalPanel);
    }

    if (!mobileLayout.matches) setNavOpen(false);
  };

  syncResponsiveLayout();
  mobileLayout.addEventListener("change", syncResponsiveLayout);

  navToggle?.addEventListener("click", () => {
    setNavOpen(!mainNav?.classList.contains("is-open"));
  });

  mainNav?.addEventListener("click", (event) => {
    if (event.target.closest('.nav-links a[href^="#"]')) setNavOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (mainNav?.classList.contains("is-open") && !mainNav.contains(event.target)) {
      setNavOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !mainNav?.classList.contains("is-open")) return;
    setNavOpen(false);
    navToggle?.focus();
  });

  const setTheme = (theme, persist = false) => {
    const isLight = theme === "light";

    if (isLight) {
      document.documentElement.dataset.theme = "light";
    } else {
      delete document.documentElement.dataset.theme;
    }

    if (themeSwitch) {
      themeSwitch.textContent = isLight ? "[ dark ]" : "[ light ]";
      themeSwitch.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} mode`);
      themeSwitch.setAttribute("aria-pressed", String(isLight));
    }

    themeColor?.setAttribute("content", isLight ? "#e5dac8" : "#090603");

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

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const appendTerminalLine = (text, className = "") => {
    if (!terminalOutput) return;

    const line = document.createElement("p");
    line.textContent = text;
    if (className) line.className = className;
    terminalOutput.append(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  };

  const appendTerminalLines = (lines, className = "") => {
    lines.forEach((line) => appendTerminalLine(line, className));
  };

  const terminalFiles = {
    "about.txt": [
      "Cornelius Putzler-Marci",
      "Software developer with a background in applied computational linguistics.",
      "I prefer clear code, predictable software and solutions other people can maintain.",
    ],
    "cv.txt": [
      "2024—now   Quantum Trade Solutions / Edgewonk — Technical Lead (full-time)",
      "2016—2023  Edgewonk — Freelance Software Developer & DevOps",
      "2016—2023  Weblicity — Software Developer",
      "2016—2021  BearCode.me — Founder & CTO",
      "2015—2016  aexea — Software Developer",
      "2008—2014  University of Stuttgart — Applied Computational Linguistics",
    ],
    "projects.txt": [
      "2016—now   Edgewonk — trading journal and analysis software",
      "2026—now   TrimWM — native macOS tiling window manager",
      "2026       pbs-vm-monitor — Proxmox Backup Server monitor",
      "2026       cor.nz reboot — this website",
      "2021—2025  Advent of Code — puzzle solutions",
      "2016—2021  BearCode.me — product-text generation",
    ],
    "hobbies.txt": ["coding puzzles", "home lab & tools", "gaming", "retro gaming", "strength training"],
    "skills.txt": [
      "languages: Swift · Kotlin · Java · TypeScript · C# · Python · JavaScript",
      "apps & web: Angular · SwiftUI · AppKit · MapKit · StoreKit · HTML / CSS",
      "backend & data: Spring Boot · Ktor · .NET · MariaDB · PostgreSQL · SQL Server · Elasticsearch",
      "systems & delivery: DevOps · Linux · Proxmox · Docker · Ansible · TeamCity · Git · Flyway",
      "platform work: REST APIs · Background Workers · S3 / MinIO · macOS Accessibility",
      "domains: NLP / NLG · Data Processing · Compliance Software · Trade Analytics",
      "responsibilities: Technical Decisions · Product Ownership · Releases · Hiring · Mentoring",
    ],
    "now.txt": [
      "role: Technical Lead",
      "current: Edgewonk",
      "working on Edgewonk since: 2016 (freelance)",
      "full-time since: 2024",
    ],
  };

  const terminalLinks = [
    ["github.url", "https://github.com/cornz"],
    ["linkedin.url", "https://www.linkedin.com/in/cornz"],
    ["x.url", "https://x.com/CPUtzler"],
  ];

  const rootFiles = [
    "cv.txt",
    "about.txt",
    "projects.txt",
    "contact.txt",
    "hobbies.txt",
    "skills.txt",
    "links.txt",
    "now.txt",
  ];

  const appendTerminalLinks = () => {
    if (!terminalOutput) return;

    appendTerminalLine("links.txt");

    terminalLinks.forEach(([label, href]) => {
      const line = document.createElement("p");
      line.append(`${label.padEnd(14)} `);
      const link = document.createElement("a");
      link.href = href;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = href;
      line.append(link);
      terminalOutput.append(line);
    });

    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  };

  const commandHistory = [];
  let historyIndex = 0;
  let completionSignature = "";

  const resetCompletion = () => {
    completionSignature = "";
  };

  const commandHandlers = {
    help(args) {
      if (args.length) {
        appendTerminalLine("usage: help");
        return;
      }
      appendTerminalLines([
        "root: pwd · ls [-la|-1]",
        "read: cat [cv.txt|about.txt|projects.txt|contact.txt|hobbies.txt|skills.txt|links.txt|now.txt]",
        "system: whoami · uname [-a] · date · history",
        "other: clear",
      ]);
    },
    whoami(args) {
      if (args.length) {
        appendTerminalLine("usage: whoami");
        return;
      }
      appendTerminalLine("guest");
    },
    pwd(args) {
      if (args.length) {
        appendTerminalLine("usage: pwd");
        return;
      }
      appendTerminalLine("/home/guest");
    },
    ls(args) {
      const allowedFlags = new Set(["-a", "-l", "-la", "-al", "-1"]);
      const flags = args.filter((arg) => arg.startsWith("-"));
      const paths = args.filter((arg) => !arg.startsWith("-"));

      if (flags.some((flag) => !allowedFlags.has(flag)) || paths.length) {
        appendTerminalLine("usage: ls [-la|-1]", "terminal-error");
        return;
      }

      appendTerminalLines(rootFiles.map((item) => `  ${item}`));
    },
    cat(args) {
      if (args.length !== 1) {
        appendTerminalLine(
          "usage: cat cv.txt | about.txt | projects.txt | contact.txt | hobbies.txt | skills.txt | links.txt | now.txt",
          "terminal-error",
        );
        return;
      }

      const target = args[0].replace(/^~\//, "").replace(/\/+$/, "");
      if (target === "contact.txt" || target === "links.txt") {
        appendTerminalLinks();
      } else if (Object.hasOwn(terminalFiles, target)) {
        appendTerminalLines(terminalFiles[target]);
      } else {
        appendTerminalLine(`cat: ${args[0]}: no such file`, "terminal-error");
      }
    },
    uname(args) {
      if (!args.length) {
        appendTerminalLine("cor.nz");
      } else if (args.length === 1 && args[0] === "-a") {
        appendTerminalLine("cor.nz 1.0 web tty1 — HTML, CSS, vanilla JavaScript");
      } else {
        appendTerminalLine("usage: uname [-a]", "terminal-error");
      }
    },
    date(args) {
      if (args.length) {
        appendTerminalLine("usage: date", "terminal-error");
        return;
      }
      appendTerminalLine(
        new Intl.DateTimeFormat("en-GB", {
          dateStyle: "full",
          timeStyle: "medium",
          timeZone: "Europe/Berlin",
        }).format(new Date()),
      );
    },
    history(args) {
      if (args.length) {
        appendTerminalLine("usage: history", "terminal-error");
        return;
      }
      appendTerminalLines(commandHistory.map((entry, index) => `${String(index + 1).padStart(3)}  ${entry}`));
    },
    clear(args) {
      if (args.length) {
        appendTerminalLine("usage: clear", "terminal-error");
        return;
      }
      if (terminalOutput) terminalOutput.replaceChildren();
    },
  };

  const longestCommonPrefix = (values) => {
    if (!values.length) return "";

    return values.slice(1).reduce((prefix, value) => {
      let index = 0;
      const limit = Math.min(prefix.length, value.length);
      while (index < limit && prefix[index].toLowerCase() === value[index].toLowerCase()) index += 1;
      return prefix.slice(0, index);
    }, values[0]);
  };

  const completeTerminalInput = () => {
    if (!terminalInput) return;

    const value = terminalInput.value;
    const parts = value.trim().split(/\s+/);
    const hasTrailingSpace = /\s$/.test(value);
    const completingCommand = parts.length === 1 && !hasTrailingSpace;
    const prefix = completingCommand ? parts[0] : hasTrailingSpace ? "" : parts.pop();
    const verb = completingCommand ? "" : parts[0].toLowerCase();
    const argumentOptions = {
      ls: ["-a", "-l", "-la", "-al", "-1"],
      cat: rootFiles,
      uname: ["-a"],
    };
    const candidates = completingCommand ? Object.keys(commandHandlers).sort() : argumentOptions[verb] || [];
    const matches = candidates.filter((candidate) => candidate.toLowerCase().startsWith(prefix.toLowerCase()));

    if (!matches.length) {
      resetCompletion();
      return;
    }

    const tokenStart = value.length - prefix.length;
    const applyCompletion = (replacement, addSpace = false) => {
      terminalInput.value = `${value.slice(0, tokenStart)}${replacement}${addSpace ? " " : ""}`;
      terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
    };

    if (matches.length === 1) {
      applyCompletion(matches[0], true);
      resetCompletion();
      return;
    }

    const commonPrefix = longestCommonPrefix(matches);
    if (commonPrefix.length > prefix.length) {
      applyCompletion(commonPrefix);
      completionSignature = "";
      return;
    }

    const signature = `${verb}|${prefix}|${matches.join("|")}`;
    if (completionSignature === signature) {
      appendTerminalLine(matches.join("  "));
      completionSignature = "";
    } else {
      completionSignature = signature;
    }
  };

  const runTerminalCommand = (command) => {
    const [verb, ...args] = command.split(/\s+/);

    if (Object.hasOwn(commandHandlers, verb)) {
      commandHandlers[verb](args);
    } else {
      appendTerminalLine(`command not found: ${command}. Try “help”.`, "terminal-error");
    }
  };

  terminalForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!terminalInput) return;

    const rawCommand = terminalInput.value.trim();
    const command = rawCommand.toLowerCase();
    terminalInput.value = "";
    resetCompletion();

    if (!command) return;

    commandHistory.push(rawCommand);
    historyIndex = commandHistory.length;
    appendTerminalLine(`guest@cor.nz:~$ ${rawCommand}`, "terminal-command");
    runTerminalCommand(command);
  });

  terminalInput?.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      if (!terminalInput.value.trim()) return;
      event.preventDefault();
      completeTerminalInput();
      return;
    }

    if (!commandHistory.length || !["ArrowUp", "ArrowDown"].includes(event.key)) return;

    event.preventDefault();
    resetCompletion();
    historyIndex += event.key === "ArrowUp" ? -1 : 1;
    historyIndex = Math.max(0, Math.min(commandHistory.length, historyIndex));
    terminalInput.value = commandHistory[historyIndex] || "";
    terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
  });

  terminalInput?.addEventListener("input", resetCompletion);

  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && observedSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${visible.target.id}`;
          link.classList.toggle("is-active", isCurrent);
          if (isCurrent) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-18% 0px -68%", threshold: [0, 0.2, 0.6] },
    );

    observedSections.forEach((section) => sectionObserver.observe(section));
  }
})();
