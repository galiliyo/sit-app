const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");

const svgPath = path.join(__dirname, "../assets/images/enso-0.svg");
let svg = fs.readFileSync(svgPath, "utf8");

// Replace currentColor with accent color
svg = svg.replace(/currentColor/g, "#cc8c28");

const sizes = [
  { name: "icon.png", size: 1024, padding: 100 },
  { name: "android-icon-foreground.png", size: 432, padding: 50 },
  { name: "splash-icon.png", size: 200, padding: 20 },
];

for (const { name, size, padding } of sizes) {
  const wrappedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#0a0a0a"/>
    <g transform="translate(${padding}, ${padding})">
      <svg width="${size - padding * 2}" height="${size - padding * 2}" viewBox="0 0 240 240">
        ${svg.replace(/<\/?svg[^>]*>/g, "")}
      </svg>
    </g>
  </svg>`;

  const resvg = new Resvg(wrappedSvg, { fitTo: { mode: "width", value: size } });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(path.join(__dirname, "../assets/images", name), pngBuffer);
  console.log(`Generated ${name} (${size}x${size})`);
}
