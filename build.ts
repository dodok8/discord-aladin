// Purpose: Build the project using Bun

await Bun.build({
  entrypoints: ['./index.ts'],
  outdir: './dist',
  minify: true,
  target: 'node',
  sourcemap: 'none',
})

export {}
