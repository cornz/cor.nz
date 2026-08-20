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
  dotGrid,
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
  readFile(new URL("../assets/dot-grid.svg", import.meta.url), "utf8"),
  readFile(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8"),
  readFile(new URL("../impressum.html", import.meta.url), "utf8"),
  readFile(new URL("../datenschutz.html", import.meta.url), "utf8"),
]);

test("uses only local assets and no npm dependencies", () => {
  const assets = [...html.matchAll(/<(?:link|script)\b[^>]+(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(assets, [
    "favicon.svg",
    "theme-init.js?v=retro-readable-17",
    "styles.css?v=retro-readable-17",
    "script.js?v=retro-readable-17",
  ]);
  assert.deepEqual(packageJson.dependencies, {});
  assert.deepEqual(packageJson.devDependencies, {});
});

test("does not use em dashes", () => {
  assert.doesNotMatch(
    [html, css, script, themeInit, readme, iconSprite, dotGrid, thirdPartyNotices, imprint, privacy].join("\n"),
    /\u2014/,
  );
});

test("serves documented technology icons from the local sprite", () => {
  const iconReferences = [...html.matchAll(/href="assets\/icons\.svg\?v=retro-readable-17#([^"]+)"/g)].map((match) => match[1]);
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
  for (const region of ["header", "nav", "main", "footer", "h1"]) {
    assert.match(html, new RegExp(`<${region}\\b`));
  }

  const sectionIds = ["experience", "skills", "work", "contact", "off-duty"];
  const positions = sectionIds.map((id) => html.indexOf(`id="${id}"`));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));

  for (const label of ["cv", "skills", "projects", "contact", "hobbies"]) {
    assert.match(html, new RegExp(`>${label}<\\/a>`));
  }
});

test("contains the verified profile, career and project information", () => {
  assert.match(html, /Technical Lead/);
  assert.match(html, />Quantum Trade Solutions<\/a>/);
  assert.equal((html.match(/>Quantum Trade Solutions<\/a>/g) ?? []).length, 2);
  assert.doesNotMatch(html, /Quantum Trade Solutions \/ Edgewonk/);
  assert.match(html, /Edgewonk/);
  assert.match(html, /Freelance Software Developer &amp; DevOps/);
  assert.match(html, /Founder &amp; CTO/);
  assert.match(html, /assets\/icons\.svg\?v=retro-readable-17#database/);
  assert.match(html, /Microsoft SQL Server/);
  assert.match(html, /href="mailto:hi@cor\.nz"/);
  assert.match(html, /assets\/icons\.svg\?v=retro-readable-17#mail/);
  assert.doesNotMatch(`${html}\n${script}`, /Weblicity|pbs-vm-monitor/);
  assert.match(html, /Trading journal and analysis software/);
  assert.match(html, /href="https:\/\/github\.com\/cornz\/TrimWM"/);
  assert.match(html, /href="https:\/\/github\.com\/cornz\/DevControlRoom"/);
  assert.doesNotMatch(html, /release candidate/);
  assert.doesNotMatch(html, /<h3><a[^>]*>[^<]+<span aria-hidden="true">[↗↑]<\/span>/);
  assert.match(html, /A native tiling window manager/);
  assert.match(html, /Menu bar controls for local development services/);
  assert.match(html, /SwiftUI/);
});

test("links CV company names without marker boxes", () => {
  for (const url of [
    "https://edgewonk.com/",
    "https://compliancesolutions.com/",
    "https://bearcode.me/",
    "https://ax-semantics.com/",
    "https://www.uni-stuttgart.de/",
  ]) {
    assert.match(html, new RegExp(`<p class="career-company"><a href="${url.replaceAll("/", "\\/")}"`));
  }
  assert.doesNotMatch(html, /company-mark/);
});

test("lists DevOps explicitly and omits signing and notarization", () => {
  assert.match(html, /<li>DevOps<\/li>/);
  assert.doesNotMatch(`${html}\n${script}`, /Signing &amp; Notarization|Signing & Notarization/i);
});

test("keeps the interface simple and content-first", () => {
  assert.doesNotMatch(html, /terminal|signal-strip|compact-header|nav-toggle/);
  assert.doesNotMatch(script, /terminal|IntersectionObserver|matchMedia/);
  assert.doesNotMatch(html, /Hello\. I am/);
  assert.match(css, /width: 780px/);
  assert.match(css, /margin: 0 auto/);
  assert.match(css, /body \{[^}]*margin: 0;[^}]*padding: 0 8px/);
  assert.match(css, /\.site-header \{[^}]*position: sticky;[^}]*top: 0;[^}]*padding-top: 8px/);
  assert.match(css, /\.nav-links a::before \{[^}]*content: "\[ "/);
  assert.match(css, /\.nav-links a::after \{[^}]*content: " \]"/);
  assert.doesNotMatch(css, /\.nav-links a,[^}]*\.theme-switch \{[^}]*border:/);
  assert.match(css, /\.skill-tags li::before,[^}]*\.contact-links > a::before,[^}]*\.interest-grid article::before \{[^}]*content: "\["/);
  assert.doesNotMatch(css, /\.skill-tags li \{[^}]*border:/);
  assert.doesNotMatch(css, /\.contact-links > a \{[^}]*border:/);
  assert.doesNotMatch(css, /\.interest-grid article \{[^}]*border:/);
  assert.match(css, /font-size: 14px/);
  assert.match(css, /--link: #ff3300/);
  assert.doesNotMatch(html, /About me|Working principles/);
});

test("supports theme persistence, responsive layout and reduced motion", () => {
  assert.match(themeInit, /localStorage\.getItem\("cor-theme"\)/);
  assert.match(themeInit, /let theme = "dark"/);
  assert.match(themeInit, /=== "light"/);
  assert.match(script, /localStorage\.setItem\("cor-theme"/);
  assert.match(html, /name="theme-color" content="#000000"/);
  assert.match(html, /aria-label="Switch to light mode" aria-pressed="false">\[ light \]<\/button>/);
  assert.match(css, /html\[data-theme="light"\]/);
  assert.match(css, /@media \(max-width: 440px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media print/);
});

test("uses the real portrait and dependency-free visual treatment", () => {
  assert.match(html, /<img src="portrait\.jpg" alt="Cornelius Putzler-Marci relaxing on a beach chair">/);
  assert.ok(portrait.length > 50_000);
  assert.deepEqual([...portrait.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  assert.match(dotGrid, /<circle\b/);
  assert.doesNotMatch(css, /filter: grayscale/);
  assert.match(css, /background-image: url\("assets\/dot-grid\.svg"\)/);
  assert.doesNotMatch(css, /radial-gradient|(^|[^-])linear-gradient\(/m);
  assert.doesNotMatch(html, /portrait\.jpg · 4:5|static · external dependencies: none/);
});

test("keeps documentation aligned with the simple retro design", () => {
  assert.match(readme, /based on the 2002 GeekBoys and SoGamed websites/);
  assert.doesNotMatch(readme, /terminal|cat skills\.txt|dense information blocks/);
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
  assert.doesNotMatch(css, /\.nav-toggle|\.terminal-|\.scanlines|\.signal-strip|\.compact-header/);
  assert.equal((css.match(/\.portrait-slot img \{/g) || []).length, 1);
});
