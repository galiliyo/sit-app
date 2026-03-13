const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");

const SIZE = 512;

// Create SVG with feTurbulence for a paper-like texture
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <filter id="paper" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" seed="42" result="noise"/>
      <feColorMatrix type="saturate" values="0" in="noise" result="gray"/>
      <feComponentTransfer in="gray" result="adjusted">
        <feFuncR type="linear" slope="0.15" intercept="0.02"/>
        <feFuncG type="linear" slope="0.15" intercept="0.02"/>
        <feFuncB type="linear" slope="0.15" intercept="0.02"/>
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="#0a0a0a"/>
  <rect width="${SIZE}" height="${SIZE}" filter="url(#paper)"/>
</svg>`;

const resvg = new Resvg(svg, { fitTo: { mode: "width", value: SIZE } });
const pngData = resvg.render();
const pngBuffer = pngData.asPng();

const outPath = path.join(__dirname, "../assets/textures/paper-texture.png");
fs.writeFileSync(outPath, pngBuffer);
console.log(`Generated paper-texture.png (${SIZE}x${SIZE})`);
