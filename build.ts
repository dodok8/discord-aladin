// Purpose: Build the project using Bun

await Bun.build({
  entrypoints: ['./index.ts'],
  outdir: './dist',
  minify: fale,
  target: 'bun',
  sourcemap: 'inline',
})

export {}
