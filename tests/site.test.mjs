import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [html, css, script, themeInit, readme, packageJson, portrait] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../styles.css", import.meta.url), "utf8"),
  readFile(new URL("../script.js", import.meta.url), "utf8"),
  readFile(new URL("../theme-init.js", import.meta.url), "utf8"),
  readFile(new URL("../README.md", import.meta.url), "utf8"),
  readFile(new URL("../package.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../portrait.jpg", import.meta.url)),
]);

test("uses only local assets and no npm dependencies", () => {
  const assets = [...html.matchAll(/<(?:link|script)\b[^>]+(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(assets, ["favicon.svg", "theme-init.js", "styles.css", "script.js"]);
  assert.deepEqual(packageJson.dependencies, {});
  assert.deepEqual(packageJson.devDependencies, {});
});

test("keeps internal and external links safe", () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const fragments = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
  const newTabLinks = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map((match) => match[0]);

  assert.ok(fragments.length > 0);
  fragments.forEach((fragment) => assert.ok(ids.has(fragment), `Missing element for #${fragment}`));
  newTabLinks.forEach((link) => assert.match(link, /rel="[^"]*noreferrer[^"]*"/));
});

test("exposes semantic content in the requested order", () => {
  for (const region of ["header", "nav", "main", "aside", "footer", "h1"]) {
    assert.match(html, new RegExp(`<${region}\\b`));
  }

  const sectionIds = ["experience", "about", "work", "contact", "off-duty"];
  const positions = sectionIds.map((id) => html.indexOf(`id="${id}"`));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));

  for (const label of ["cv", "about", "projects", "contact", "hobbies"]) {
    assert.match(html, new RegExp(`> ${label}<\\/a>`));
  }
});

test("contains the verified profile, career and project information", () => {
  assert.match(html, /Technical Lead @ Edgewonk/);
  assert.match(html, /Freelance Software Developer &amp; DevOps/);
  assert.match(html, /Founder &amp; CTO/);
  assert.match(html, /aria-label="Edgewonk, 2016 to now"/);
  assert.match(html, /href="https:\/\/github\.com\/cornz\/TrimWM"/);
  assert.match(html, /Villingen-Schwenningen/);
  assert.match(html, /class="scope-tags"/);
});

test("lists DevOps explicitly and omits signing and notarization", () => {
  assert.match(html, /<li>DevOps<\/li>/);
  assert.match(script, /systems & delivery: DevOps · Linux · Proxmox/);
  assert.doesNotMatch(`${html}\n${script}`, /Signing &amp; Notarization|Signing & Notarization/i);
});

test("provides a flat, text-file-oriented terminal", () => {
  for (const file of ["cv.txt", "about.txt", "projects.txt", "contact.txt", "hobbies.txt", "skills.txt"]) {
    assert.match(script, new RegExp(file.replace(".", "\\.")));
  }

  assert.match(script, /const terminalFiles = \{/);
  assert.match(script, /Object\.hasOwn\(terminalFiles, target\)/);
  assert.match(script, /const completeTerminalInput/);
  assert.match(script, /event\.key === "Tab"/);
  assert.match(script, /line\.textContent = text/);
  assert.doesNotMatch(script, /terminalOutput\.innerHTML|\n    cd\(args\)/);
});

test("supports theme persistence, responsive layout and reduced motion", () => {
  assert.match(themeInit, /localStorage\.getItem\("cor-theme"\)/);
  assert.match(script, /localStorage\.setItem\("cor-theme"/);
  assert.match(css, /html\[data-theme="light"\]/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /\.signal-strip \{\s*grid-template-columns: 1fr;/);
  assert.match(css, /\.mobile-terminal-dock \{[\s\S]*?display: block;/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media print/);
});

test("uses the real portrait and dependency-free visual treatment", () => {
  assert.match(html, /<img src="portrait\.jpg" alt="Cornelius Putzler-Marci relaxing on a beach chair">/);
  assert.ok(portrait.length > 50_000);
  assert.deepEqual([...portrait.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  assert.doesNotMatch(css, /radial-gradient|(^|[^-])linear-gradient\(/m);
  assert.doesNotMatch(html, /portrait\.jpg · 4:5|static · external dependencies: none/);
});

test("keeps documentation aligned with the flat terminal", () => {
  assert.match(readme, /cat skills\.txt/);
  assert.doesNotMatch(readme, /cd projects|commands and paths|Replace the short “Off-duty” entries/);
});

test("does not retain removed CSS scaffolding", () => {
  assert.doesNotMatch(css, /\.nav-links a::after|\.edit-note|\.hero-copy > \.section-index/);
  assert.equal((css.match(/\.portrait-slot img \{/g) || []).length, 1);
  assert.equal((css.match(/\.status-badge i \{/g) || []).length, 1);
});
