#!/usr/bin/env node
/**
 * Generates an SVG noise + scratch texture for Figma import.
 * Outputs a transparent-background SVG with:
 *   - fine grain noise (tiny dots at varied opacity)
 *   - organic scratch marks (thin irregular paths)
 *
 * Usage: node scripts/generate-noise-texture.js
 * Output: assets/textures/noise-scratches.svg
 */

const fs = require("fs");
const path = require("path");

const WIDTH = 390;
const HEIGHT = 844;

// Seeded pseudo-random for reproducibility
let seed = 42;
function rand() {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}
function randRange(min, max) {
  return min + rand() * (max - min);
}

// ── Noise dots ──────────────────────────────────────────────
function generateNoiseDots(count) {
  const dots = [];
  for (let i = 0; i < count; i++) {
    const x = randRange(0, WIDTH).toFixed(1);
    const y = randRange(0, HEIGHT).toFixed(1);
    const r = randRange(0.3, 1.2).toFixed(2);
    const opacity = randRange(0.02, 0.12).toFixed(3);
    // Mix of light and dark dots for organic feel
    const color = rand() > 0.6 ? "#ffffff" : "#888888";
    dots.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}"/>`);
  }
  return dots.join("\n    ");
}

// ── Scratch lines ───────────────────────────────────────────
function generateScratches(count) {
  const lines = [];
  for (let i = 0; i < count; i++) {
    const x1 = randRange(0, WIDTH);
    const y1 = randRange(0, HEIGHT);
    // Scratches are mostly vertical/diagonal, varied length
    const length = randRange(15, 120);
    const angle = randRange(-30, 30) * (Math.PI / 180); // near-vertical
    const x2 = x1 + Math.sin(angle) * length;
    const y2 = y1 + Math.cos(angle) * length;

    // Add slight curve for organic feel
    const cx = (x1 + x2) / 2 + randRange(-8, 8);
    const cy = (y1 + y2) / 2 + randRange(-4, 4);

    const opacity = randRange(0.03, 0.09).toFixed(3);
    const strokeWidth = randRange(0.3, 0.8).toFixed(2);
    const color = rand() > 0.5 ? "#ffffff" : "#aaaaaa";

    lines.push(
      `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" ` +
        `stroke="${color}" stroke-width="${strokeWidth}" fill="none" opacity="${opacity}" stroke-linecap="round"/>`
    );
  }
  return lines.join("\n    ");
}

// ── Subtle dust specks (larger, very faint) ─────────────────
function generateDustSpecks(count) {
  const specks = [];
  for (let i = 0; i < count; i++) {
    const x = randRange(0, WIDTH).toFixed(1);
    const y = randRange(0, HEIGHT).toFixed(1);
    const r = randRange(1.5, 4).toFixed(2);
    const opacity = randRange(0.01, 0.04).toFixed(3);
    specks.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="${opacity}"/>`);
  }
  return specks.join("\n    ");
}

// ── Assemble SVG ────────────────────────────────────────────
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <!-- Noise + Scratch texture — transparent background, import into Figma as overlay -->

  <!-- Fine grain noise -->
  <g id="noise">
    ${generateNoiseDots(2000)}
  </g>

  <!-- Organic scratch marks -->
  <g id="scratches">
    ${generateScratches(60)}
  </g>

  <!-- Dust specks -->
  <g id="dust">
    ${generateDustSpecks(40)}
  </g>
</svg>`;

// Write output
const outDir = path.join(__dirname, "..", "assets", "textures");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "noise-scratches.svg");
fs.writeFileSync(outPath, svg, "utf8");

console.log(`✓ Generated ${outPath}`);
console.log(`  ${WIDTH}x${HEIGHT}, ~2000 dots, 60 scratches, 40 dust specks`);
console.log(`  Import into Figma: File → Place Image, or drag & drop`);
