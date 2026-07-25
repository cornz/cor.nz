import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [
  html,
  css,
  script,
  themeInit,
  readme,
  packageJson,
  portrait,
  iconSprite,
  thirdPartyNotices,
  imprint,
  privacy,
] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../styles.css", import.meta.url), "utf8"),
  readFile(new URL("../script.js", import.meta.url), "utf8"),
  readFile(new URL("../theme-init.js", import.meta.url), "utf8"),
  readFile(new URL("../README.md", import.meta.url), "utf8"),
  readFile(new URL("../package.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../portrait.jpg", import.meta.url)),
  readFile(new URL("../assets/icons.svg", import.meta.url), "utf8"),
  readFile(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8"),
  readFile(new URL("../impressum.html", import.meta.url), "utf8"),
  readFile(new URL("../datenschutz.html", import.meta.url), "utf8"),
]);

test("uses only local assets and no npm dependencies", () => {
  const assets = [...html.matchAll(/<(?:link|script)\b[^>]+(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(assets, ["favicon.svg", "theme-init.js", "styles.css", "script.js"]);
  assert.deepEqual(packageJson.dependencies, {});
  assert.deepEqual(packageJson.devDependencies, {});
});

test("serves documented technology icons from the local sprite", () => {
  const iconReferences = [...html.matchAll(/href="assets\/icons\.svg#([^"]+)"/g)].map((match) => match[1]);
  const iconIds = new Set([...iconSprite.matchAll(/<symbol id="([^"]+)"/g)].map((match) => match[1]));

  assert.ok(iconReferences.length >= 20);
  iconReferences.forEach((icon) => assert.ok(iconIds.has(icon), `Missing icon symbol: ${icon}`));
  assert.match(thirdPartyNotices, /Simple Icons/);
  assert.match(thirdPartyNotices, /no endorsement or affiliation is\s+implied/);
  assert.doesNotMatch(html, /https?:\/\/[^"]+\.svg/);
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
  assert.match(html, /Compliance Solutions/);
  assert.match(script, /Compliance Solutions — Software Developer/);
  assert.match(html, /assets\/icons\.svg#database/);
  assert.match(html, /Microsoft SQL Server/);
  assert.match(script, /Microsoft SQL Server/);
  assert.match(html, /href="mailto:hi@cor\.nz"/);
  assert.match(html, /assets\/icons\.svg#mail/);
  assert.match(script, /\["email", "mailto:hi@cor\.nz"\]/);
  assert.doesNotMatch(`${html}\n${script}`, /Weblicity|pbs-vm-monitor/);
  assert.match(html, /aria-label="Edgewonk, 2016 to now"/);
  assert.match(html, /href="https:\/\/github\.com\/cornz\/TrimWM"/);
  assert.doesNotMatch(html, /release candidate/);
  const trimStart = html.indexOf('aria-label="TrimWM, 2026 to now"');
  const trimEnd = html.indexOf('<li class="career-lane', trimStart);
  assert.match(html.slice(trimStart, trimEnd), /open source/);
  assert.match(html, /Villingen-Schwenningen/);
  assert.match(html, /class="scope-tags"/);
});

test("links company markers and names to their websites", () => {
  for (const url of [
    "https://edgewonk.com/",
    "https://compliancesolutions.com/",
    "https://bearcode.me/",
    "https://ax-semantics.com/",
    "https://www.uni-stuttgart.de/",
  ]) {
    assert.match(html, new RegExp(`<a href="${url.replaceAll("/", "\\/")}"[^>]*>[\\s\\S]{0,180}company-mark`));
  }
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

test("publishes local legal notices with the supplied contact details", () => {
  assert.match(html, /href="impressum\.html"/);
  assert.match(html, /href="datenschutz\.html"/);

  for (const page of [imprint, privacy]) {
    assert.match(page, /meta name="robots" content="noindex, follow"/);
    assert.match(page, /Cornelius Putzler-Marci/);
    assert.match(page, /Luxemburger Str\. 12/);
    assert.match(page, /78052 Villingen-Schwenningen/);
    assert.match(page, /mailto:legal@cor\.nz/);
    assert.doesNotMatch(page, /<(?:script|link)\b[^>]+(?:src|href)="https?:/);
  }

  assert.match(imprint, /Section 5 DDG/);
  assert.match(imprint, /Section 18\(1\) MStV/);
  assert.match(privacy, /netcup GmbH/);
  assert.match(privacy, /data processing agreement pursuant to Article 28 GDPR/);
  assert.match(privacy, /operator does not store HTTP access logs/);
  assert.match(privacy, /Email for the <code>cor\.nz<\/code> domain is hosted through iCloud\s+Mail/);
  assert.match(privacy, /Apple Distribution International Ltd\./);
  assert.match(privacy, /apple\.com\/legal\/privacy\/en-ww/);
  assert.match(privacy, /cor-theme/);
  assert.match(privacy, /No analytics, advertising or tracking cookies are used/);
  assert.doesNotMatch(privacy, /Caddy/);
});

test("does not retain removed CSS scaffolding", () => {
  assert.doesNotMatch(css, /\.nav-links a::after|\.edit-note|\.hero-copy > \.section-index/);
  assert.equal((css.match(/\.portrait-slot img \{/g) || []).length, 1);
  assert.equal((css.match(/\.status-badge i \{/g) || []).length, 1);
});
