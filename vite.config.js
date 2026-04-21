import sharp from 'sharp'
import { resolve } from 'path'

const images = [
  { dir: resolve('src/images/screenshots'), out: 'shot', resize: { width: 720 }, avif: { quality: 75 }, webp: { quality: 85 }, png: { palette: true, quality: 90, effort: 10 } },
  { dir: resolve('src/images/app-icon'),    out: 'icon', avif: { quality: 80 }, webp: { quality: 90 }, png: { palette: true, quality: 95, effort: 10 } },
]

function imagePlugin() {
  return {
    name: 'image-formats',
    async buildStart() {
      await Promise.all(images.flatMap(({ dir, out, resize, avif, webp, png }) => {
        const src = sharp(resolve(dir, 'original.png'))
        const s = resize ? src.resize(resize) : src
        return [
          s.clone().avif(avif).toFile(resolve(dir, `${out}.avif`)),
          s.clone().webp(webp).toFile(resolve(dir, `${out}.webp`)),
          s.clone().png(png).toFile(resolve(dir, `${out}.png`)),
        ]
      }))
    },
  }
}

function inlineCssPlugin() {
  let css = ''
  return {
    name: 'inline-css',
    apply: 'build',
    generateBundle(_, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && chunk.type === 'asset') {
          css = chunk.source
          delete bundle[fileName]
        }
      }
    },
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet"[^>]*>/,
        `<style>${css}</style>`
      )
    },
  }
}

export default {
  root: 'src',
  base: './',
  plugins: [imagePlugin(), inlineCssPlugin()],
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
}
