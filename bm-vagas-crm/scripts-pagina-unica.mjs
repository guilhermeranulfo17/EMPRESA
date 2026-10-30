// Junta o build num único arquivo HTML para publicar como página no claude.ai.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
const dir = 'dist/assets'
const arquivos = readdirSync(dir)
const js = readFileSync(`${dir}/${arquivos.find((f) => f.endsWith('.js'))}`, 'utf8').replaceAll('</script', '<\\/script')
const css = readFileSync(`${dir}/${arquivos.find((f) => f.endsWith('.css'))}`, 'utf8').replaceAll('</style', '<\\/style')
const html = `<title>BM Vagas CRM</title>
<meta name="theme-color" content="#F2F0EC">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Exo+2:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap">
<style>:root{color-scheme:light}html,body{background:#F2F0EC;color:#1A1714}
${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`
writeFileSync(process.argv[2], html)
console.log('ok', (html.length / 1024).toFixed(0), 'KB')
