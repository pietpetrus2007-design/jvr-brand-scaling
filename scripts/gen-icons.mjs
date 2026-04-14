import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const iconsDir = path.join(__dirname, '..', 'public', 'icons')

async function makeIcon(size, outFile) {
  const fontSize = Math.round(size * 0.28)
  const svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FF6B00"/>
  <text
    x="50%"
    y="50%"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${fontSize}"
    font-weight="bold"
    fill="white"
    text-anchor="middle"
    dominant-baseline="central"
  >JvR</text>
</svg>`

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outFile)

  console.log(`Generated ${outFile}`)
}

await makeIcon(192, `${iconsDir}/icon-192.png`)
await makeIcon(512, `${iconsDir}/icon-512.png`)
