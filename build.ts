// Purpose: Build the project using Bun

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  minify: true,
  target: 'node',
  sourcemap: 'none',
})

export {}
